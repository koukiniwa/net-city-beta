# IPアドレス記録機能 セットアップガイド

## 概要

このガイドでは、NET CITY βにIPアドレス記録機能を追加するための手順を説明します。

## 機能

- ✅ メッセージ投稿時にIPアドレスを自動記録
- ✅ IPログはFirestoreに保存（管理者のみアクセス可能）
- ✅ 管理者画面でIPログを確認
- ✅ 1年後に自動削除
- ✅ ユーザーにはIPを表示しない

## 前提条件

- Firebase Blaze（従量課金）プランが必要
- Node.js 18以降がインストールされていること
- Firebase CLIがインストールされていること

```bash
npm install -g firebase-tools
```

## セットアップ手順

### 1. Firebase Blazeプランにアップグレード

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「net-city-beta」を選択
3. 左下の「Spark」をクリックして「Blaze」にアップグレード

### 2. Firestoreを有効化

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 本番環境モードで開始
4. ロケーション: `asia-northeast1`（東京）を選択

### 3. Firebase匿名認証を有効化

1. Firebase Consoleで「Authentication」を選択
2. 「Sign-in method」タブを開く
3. 「匿名」を有効化

### 4. Cloud Functionsの依存関係をインストール

```bash
cd functions
npm install
```

### 5. Cloud Functionsをデプロイ

```bash
# プロジェクトルートディレクトリで実行
firebase deploy --only functions

# または、特定の関数のみデプロイ
firebase deploy --only functions:sendMessage
firebase deploy --only functions:cleanupOldIpLogs
firebase deploy --only functions:getIpLogs
```

### 6. Firestoreセキュリティルールをデプロイ

```bash
firebase deploy --only firestore:rules
```

### 7. 管理者アカウントを作成

1. Firebase Consoleで「Authentication」を選択
2. 「Users」タブで「Add user」をクリック
3. メールアドレスとパスワードを設定

### 8. 管理者にカスタムクレームを付与

Firebase CLIを使用：

```bash
firebase auth:export users.json
```

または、Node.jsスクリプトで：

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdminClaim(email) {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`管理者権限を付与: ${email}`);
}

setAdminClaim('your-admin-email@example.com');
```

## 使用方法

### ユーザー側

特に変更はありません。メッセージを送信すると、自動的にIPアドレスが記録されます。

### 管理者側

1. `https://your-site.com/tools/admin-ip-logs.html` にアクセス
2. 管理者メールアドレスとパスワードでログイン
3. 「ログを読み込む」ボタンをクリック
4. フィルターを使用して特定のルームやユーザーのログを表示

## データ構造

### Firestore: `ipLogs` コレクション

```javascript
{
  messageId: "メッセージID",
  roomId: "ルームID",
  userId: "ユーザーID",
  userNumber: 12345,
  displayNumber: "No.12345",
  ipAddress: "192.168.1.1",
  timestamp: Timestamp,
  timestampMs: 1234567890000,
  expiresAt: Timestamp // 1年後
}
```

## Cloud Functions

### `sendMessage`

- **トリガー**: HTTPSリクエスト（Callable Function）
- **処理**: メッセージをRealtime DBに保存し、IPログをFirestoreに保存
- **認証**: 匿名認証が必要

### `cleanupOldIpLogs`

- **トリガー**: 定期実行（毎日午前3時）
- **処理**: 1年以上前のIPログを削除

### `getIpLogs`

- **トリガー**: HTTPSリクエスト（Callable Function）
- **処理**: IPログを取得（管理者のみ）
- **認証**: 管理者カスタムクレームが必要

## セキュリティ

- IPログは管理者のみアクセス可能
- Firestoreセキュリティルールで保護
- Cloud Functionsでのみ書き込み可能
- 一般ユーザーには表示されない

## コスト見積もり

Firebase Blazeプランの料金（概算）：

- **Cloud Functions**:
  - 無料枠: 200万回/月の呼び出し
  - 超過分: $0.40/100万回

- **Firestore**:
  - 読み取り: 5万件/日まで無料
  - 書き込み: 2万件/日まで無料
  - ストレージ: 1GB/月まで無料

通常の使用では、ほとんどが無料枠内で収まります。

## トラブルシューティング

### エラー: "unauthenticated"

→ Firebase匿名認証が有効になっていることを確認してください。

### エラー: "permission-denied"

→ 管理者カスタムクレームが正しく設定されていることを確認してください。

### Functions がデプロイできない

→ Firebase Blazeプランにアップグレードされていることを確認してください。

### IPが "unknown" と表示される

→ Cloud Functionsのリージョンが正しく設定されていることを確認してください。

## 注意事項

- IPアドレスは個人情報に該当する可能性があります
- プライバシーポリシーに記載が必要です
- 法令遵守を確認してください
- 管理者権限は慎重に付与してください

## サポート

問題が発生した場合は、Firebase Consoleの「Functions」タブでログを確認してください。

```bash
firebase functions:log
```
