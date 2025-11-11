/**
 * Cloud Functions for NET CITY β
 * IPアドレス記録機能
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const axios = require("axios");

// Firebase Admin SDKの初期化
admin.initializeApp({
    databaseURL: 'https://net-city-beta-default-rtdb.asia-southeast1.firebasedatabase.app'
});

/**
 * メッセージ投稿API（IPアドレス記録付き）
 * リージョン: asia-northeast1 (東京)
 */
exports.sendMessage = onCall(
    { region: 'asia-northeast1' },
    async (request) => {
        try {
            const firestore = admin.firestore();
            const database = admin.database();

            // リクエストの検証
            if (!request.auth) {
                throw new Error('ユーザー認証が必要です');
            }

            // データの検証
            const { roomId, userId, userNumber, displayNumber, text } = request.data;

            if (!roomId || !userId || !text) {
                throw new Error('必須パラメータが不足しています');
            }

            // テキストの長さチェック
            if (text.length > 500) {
                throw new Error('メッセージは500文字以内で入力してください');
            }

            // IPアドレスを取得
            const ipAddress = request.rawRequest.ip ||
                request.rawRequest.headers['x-forwarded-for'] ||
                request.rawRequest.connection?.remoteAddress ||
                'unknown';

            // タイムスタンプ
            const timestamp = Date.now();

            // Realtime Databaseにメッセージを保存
            const messageRef = database.ref(`roomMessages/${roomId}`).push();
            const messageId = messageRef.key;

            const messageData = {
                userId: userId,
                userNumber: parseInt(userNumber),
                displayNumber: displayNumber,
                text: text,
                timestamp: timestamp
            };

            await messageRef.set(messageData);

            // FirestoreにIPログを保存（管理者のみアクセス可能）
            await firestore.collection('ipLogs').add({
                messageId: messageId,
                roomId: roomId,
                userId: userId,
                userNumber: parseInt(userNumber),
                displayNumber: displayNumber,
                text: text, // メッセージ内容も保存
                ipAddress: ipAddress,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                timestampMs: timestamp,
                // 1年後に削除（自動削除用）
                expiresAt: admin.firestore.Timestamp.fromMillis(timestamp + (365 * 24 * 60 * 60 * 1000))
            });

            logger.info(`メッセージ送信完了: ${messageId}, IP: ${ipAddress}`);

            return {
                success: true,
                messageId: messageId,
                timestamp: timestamp
            };

        } catch (error) {
            logger.error('メッセージ送信エラー:', error);
            throw error;
        }
    }
);

/**
 * 古いIPログを削除する定期実行関数
 * 毎日午前3時（JST）に実行
 * リージョン: asia-northeast1 (東京)
 */
exports.cleanupOldIpLogs = onSchedule(
    {
        schedule: '0 3 * * *',
        timeZone: 'Asia/Tokyo',
        region: 'asia-northeast1'
    },
    async (event) => {
        try {
            const firestore = admin.firestore();
            const now = admin.firestore.Timestamp.now();

            // 期限切れのログを検索
            const expiredLogsQuery = firestore
                .collection('ipLogs')
                .where('expiresAt', '<', now)
                .limit(500); // 一度に500件まで削除

            const snapshot = await expiredLogsQuery.get();

            if (snapshot.empty) {
                logger.info('削除対象のIPログはありません');
                return null;
            }

            // バッチ削除
            const batch = firestore.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            logger.info(`${snapshot.size}件のIPログを削除しました`);

            return null;
        } catch (error) {
            logger.error('IPログ削除エラー:', error);
            return null;
        }
    }
);

/**
 * 古いメッセージを削除する定期実行関数
 * 7日以上前のメッセージを自動削除
 * 毎日午前4時（JST）に実行
 * リージョン: asia-northeast1 (東京)
 */
exports.cleanupOldMessages = onSchedule(
    {
        schedule: '0 4 * * *',
        timeZone: 'Asia/Tokyo',
        region: 'asia-northeast1'
    },
    async (event) => {
        try {
            const database = admin.database();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7日間
            const now = Date.now();
            const cutoffTime = now - sevenDaysInMs;

            let totalDeleted = 0;

            // 全ルームのメッセージをチェック
            const roomsSnapshot = await database.ref('rooms').once('value');
            if (!roomsSnapshot.exists()) {
                logger.info('ルームが存在しません');
                return null;
            }

            const rooms = roomsSnapshot.val();

            for (const roomId in rooms) {
                const messagesRef = database.ref(`roomMessages/${roomId}`);
                const messagesSnapshot = await messagesRef.once('value');

                if (!messagesSnapshot.exists()) continue;

                const messages = messagesSnapshot.val();
                const updates = {};

                // 7日以上前のメッセージを削除対象にする
                for (const messageId in messages) {
                    const message = messages[messageId];
                    if (message.timestamp && message.timestamp < cutoffTime) {
                        updates[messageId] = null; // nullで削除
                        totalDeleted++;
                    }
                }

                // バッチ削除
                if (Object.keys(updates).length > 0) {
                    await messagesRef.update(updates);
                    logger.info(`ルーム ${roomId}: ${Object.keys(updates).length}件のメッセージを削除`);
                }
            }

            logger.info(`合計 ${totalDeleted}件のメッセージを削除しました`);
            return null;
        } catch (error) {
            logger.error('メッセージ削除エラー:', error);
            return null;
        }
    }
);

/**
 * 管理者用：IPログ取得API
 * 管理者のみアクセス可能
 * リージョン: asia-northeast1 (東京)
 */
exports.getIpLogs = onCall(
    { region: 'asia-northeast1' },
    async (request) => {
        try {
            const firestore = admin.firestore();

            // 管理者チェック（カスタムクレームで実装を想定）
            if (!request.auth || !request.auth.token.admin) {
                throw new Error('管理者権限が必要です');
            }

            const { roomId, userId, limit = 100 } = request.data;

            let query = firestore.collection('ipLogs').orderBy('timestampMs', 'desc').limit(limit);

            // フィルタリング
            if (roomId) {
                query = query.where('roomId', '==', roomId);
            }
            if (userId) {
                query = query.where('userId', '==', userId);
            }

            const snapshot = await query.get();
            const logs = [];

            snapshot.forEach((doc) => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return {
                success: true,
                logs: logs,
                count: logs.length
            };

        } catch (error) {
            logger.error('IPログ取得エラー:', error);
            throw error;
        }
    }
);

/**
 * Gemini APIを使って話題を生成する関数
 * リージョン: asia-northeast1 (東京)
 */
exports.generateTopicsWithGemini = onCall(
    { region: 'asia-northeast1' },
    async (request) => {
        try {
            const { category } = request.data;

            if (!category) {
                throw new Error('カテゴリが指定されていません');
            }

            // Gemini API Key
            const GEMINI_API_KEY = 'AIzaSyBMcZPQilay80mplp5iXJOfKzJFg2m83xY';

            // カテゴリごとのプロンプト
            const prompts = {
                main: '日本語で、気軽な雑談に使える話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。例：「最近ハマっていることは？」',
                hobby: '日本語で、趣味やエンターテイメントに関する話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。',
                consultation: '日本語で、相談しやすい話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。',
                night: '日本語で、深夜の雑談に適した話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。',
                news: 'Google検索を使って、最新の日本のニュースを3つ教えてください。各ニュースについて、タイトルとURLを含めてください。JSON形式で返してください：[{"title": "ニュースタイトル", "url": "https://..."}]'
            };

            const prompt = prompts[category] || prompts.main;

            // Gemini APIを呼び出し
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 500,
                    },
                    // Google Search Groundingを有効化（ニュースカテゴリのみ）
                    ...(category === 'news' ? {
                        tools: [{
                            googleSearchRetrieval: {
                                dynamicRetrievalConfig: {
                                    mode: "MODE_DYNAMIC",
                                    dynamicThreshold: 0.3
                                }
                            }
                        }]
                    } : {})
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const generatedText = response.data.candidates[0].content.parts[0].text;

            logger.info('Gemini応答:', generatedText);

            // ニュースカテゴリの場合はJSON形式でパース
            if (category === 'news') {
                try {
                    // JSON部分を抽出（マークダウンコードブロックを除去）
                    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const topics = JSON.parse(jsonMatch[0]);
                        return { success: true, topics };
                    }
                } catch (e) {
                    logger.warn('JSON パースエラー、テキスト形式にフォールバック');
                }
            }

            // テキスト形式の話題をパース（1行ずつ）
            const lines = generatedText.split('\n').filter(line => line.trim());
            const topics = lines
                .filter(line => line.match(/^[0-9１-９\-\*\•]/) || line.includes('？'))
                .map(line => line.replace(/^[0-9１-９\-\*\•\.\)）\s]+/, '').trim())
                .filter(topic => topic.length > 0)
                .slice(0, 3);

            return {
                success: true,
                topics: topics.map(topic => ({ title: topic, url: null }))
            };

        } catch (error) {
            logger.error('Gemini API エラー:', error);
            throw error;
        }
    }
);
