/**
 * Cloud Functions for NET CITY β
 * IPアドレス記録機能
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Firebase Admin SDKの初期化
admin.initializeApp();

// Firestore インスタンス
const firestore = admin.firestore();
// Realtime Database インスタンス
const database = admin.database();

/**
 * メッセージ投稿API（IPアドレス記録付き）
 * リージョン: asia-northeast1 (東京)
 */
exports.sendMessage = onCall(
    { region: 'asia-northeast1' },
    async (request) => {
        try {
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
                text: sanitizedText, // メッセージ内容も保存
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
 * 管理者用：IPログ取得API
 * 管理者のみアクセス可能
 * リージョン: asia-northeast1 (東京)
 */
exports.getIpLogs = onCall(
    { region: 'asia-northeast1' },
    async (request) => {
        try {
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
