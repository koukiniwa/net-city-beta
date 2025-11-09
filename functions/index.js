/**
 * Cloud Functions for NET CITY β
 * IPアドレス記録機能
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Firebase Admin SDKの初期化
admin.initializeApp();

// Firestore インスタンス
const firestore = admin.firestore();
// Realtime Database インスタンス
const database = admin.database();

/**
 * メッセージ投稿API（IPアドレス記録付き）
 *
 * HTTPSトリガー関数
 * フロントエンドから呼び出され、メッセージをRealtime DBに保存し、IPをFirestoreに記録
 */
exports.sendMessage = functions.https.onCall(async (data, context) => {
    try {
        // リクエストの検証
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'ユーザー認証が必要です');
        }

        // データの検証
        const { roomId, userId, userNumber, displayNumber, text } = data;

        if (!roomId || !userId || !text) {
            throw new functions.https.HttpsError('invalid-argument', '必須パラメータが不足しています');
        }

        // テキストの長さチェック
        if (text.length > 500) {
            throw new functions.https.HttpsError('invalid-argument', 'メッセージは500文字以内で入力してください');
        }

        // IPアドレスを取得
        const ipAddress = context.rawRequest.ip ||
                         context.rawRequest.headers['x-forwarded-for'] ||
                         context.rawRequest.connection.remoteAddress ||
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
            ipAddress: ipAddress,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            timestampMs: timestamp,
            // 1年後に削除（自動削除用）
            expiresAt: admin.firestore.Timestamp.fromMillis(timestamp + (365 * 24 * 60 * 60 * 1000))
        });

        console.log(`メッセージ送信完了: ${messageId}, IP: ${ipAddress}`);

        return {
            success: true,
            messageId: messageId,
            timestamp: timestamp
        };

    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * 古いIPログを削除する定期実行関数
 * 毎日午前3時（JST）に実行
 */
exports.cleanupOldIpLogs = functions.pubsub
    .schedule('0 3 * * *')
    .timeZone('Asia/Tokyo')
    .onRun(async (context) => {
        try {
            const now = admin.firestore.Timestamp.now();

            // 期限切れのログを検索
            const expiredLogsQuery = firestore
                .collection('ipLogs')
                .where('expiresAt', '<', now)
                .limit(500); // 一度に500件まで削除

            const snapshot = await expiredLogsQuery.get();

            if (snapshot.empty) {
                console.log('削除対象のIPログはありません');
                return null;
            }

            // バッチ削除
            const batch = firestore.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log(`${snapshot.size}件のIPログを削除しました`);

            return null;
        } catch (error) {
            console.error('IPログ削除エラー:', error);
            return null;
        }
    });

/**
 * 管理者用：IPログ取得API
 * 管理者のみアクセス可能
 */
exports.getIpLogs = functions.https.onCall(async (data, context) => {
    try {
        // 管理者チェック（カスタムクレームで実装を想定）
        if (!context.auth || !context.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', '管理者権限が必要です');
        }

        const { roomId, userId, limit = 100 } = data;

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
        console.error('IPログ取得エラー:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
