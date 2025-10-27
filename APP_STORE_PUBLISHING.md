# NET CITY β - App Store 公開ガイド

## 📋 公開前チェックリスト

### 必須要件
- [ ] Macコンピュータ（Xcodeが必要）
- [ ] Apple Developer Program アカウント（年間 $99 USD）
- [ ] 最新版のXcode（App Storeからインストール）
- [ ] アプリのテストが完了していること
- [ ] プライバシーポリシーページの準備

---

## 🎯 ステップ1: Apple Developer Program 登録

### 1-1. アカウント作成
1. [Apple Developer](https://developer.apple.com/programs/) にアクセス
2. 「Enroll」をクリック
3. Apple IDでサインイン（または新規作成）
4. 個人/組織を選択
5. 必要情報を入力
6. クレジットカードで $99 USD を支払い

### 1-2. 登録完了まで
- 通常24〜48時間で承認
- メールで承認通知が届く

---

## 🔧 ステップ2: Xcodeプロジェクトの準備

### 2-1. プロジェクトを最新に同期
```bash
cd "/mnt/c/Users/kouki/OneDrive/デスクトップ/new city"

# アイコンとスプラッシュスクリーンを生成
npm run assets

# iOSプロジェクトに同期
npm run sync:ios

# CocoaPods の依存関係をインストール
cd ios/App
pod install
cd ../..
```

### 2-2. Xcodeで開く
```bash
npm run open:ios
```

### 2-3. プロジェクト設定を更新

#### General タブ
1. **Bundle Identifier**: `com.netcity.app`（変更する場合は他の場所でも一致させる）
2. **Display Name**: `NET CITY β`
3. **Version**: `1.0.0`
4. **Build**: `1`
5. **Deployment Target**: iOS 13.0 以上
6. **Signing & Capabilities** の **Team** を選択（Developer アカウント）

#### Signing & Capabilities タブ
1. **Automatically manage signing** にチェック
2. **Team** でApple Developer アカウントを選択
3. Provisioning Profile が自動生成される

---

## 📱 ステップ3: App Store Connect の設定

### 3-1. App Store Connect にアクセス
1. [App Store Connect](https://appstoreconnect.apple.com/) にアクセス
2. Apple Developer アカウントでサインイン

### 3-2. 新規アプリを作成
1. 「マイApp」→「+」ボタン→「新規App」
2. 以下を入力:
   - **プラットフォーム**: iOS
   - **名前**: NET CITY β
   - **主要言語**: 日本語
   - **バンドルID**: com.netcity.app
   - **SKU**: netcity-beta-001（任意の一意な文字列）
   - **ユーザーアクセス**: フルアクセス

### 3-3. App情報を入力

#### 必須情報
- **カテゴリ**:
  - プライマリ: ソーシャルネットワーキング
  - セカンダリ: エンターテインメント（任意）
- **価格**: 無料

#### App のプライバシー
- **プライバシーポリシーURL**: https://koukiniwa.github.io/net-city-beta/privacy.html
  - ※後ほど作成します

#### 年齢制限
- 「4+」を推奨（チャット機能があるためモデレーションに注意）

---

## 🎨 ステップ4: アプリストア用アセットの準備

### 4-1. 必要なスクリーンショット

#### iPhone 6.9インチディスプレイ（iPhone 16 Pro Max など）
- サイズ: **1320 x 2868 ピクセル** または **2868 x 1320 ピクセル**
- 最低 1枚、最大 10枚

#### iPhone 6.7インチディスプレイ（iPhone 15 Pro Max など）
- サイズ: **1290 x 2796 ピクセル** または **2796 x 1290 ピクセル**
- 最低 1枚、最大 10枚

#### iPhone 6.5インチディスプレイ（iPhone 11 Pro Max など）
- サイズ: **1242 x 2688 ピクセル** または **2688 x 1242 ピクセル**
- 最低 1枚、最大 10枚

#### iPad Pro 13インチディスプレイ
- サイズ: **2064 x 2752 ピクセル** または **2752 x 2064 ピクセル**
- 最低 1枚、最大 10枚

**ヒント**: Xcodeのシミュレータで実行して、スクリーンショットを撮影できます。

### 4-2. App アイコン
- サイズ: **1024 x 1024 ピクセル**
- 形式: PNG（透明背景なし）
- すでに `resources/icon.png` にあるものを使用可能

### 4-3. App プレビュー動画（任意）
- 長さ: 15〜30秒
- 形式: .mov, .m4v, .mp4
- 各デバイスサイズに対応

---

## 📝 ステップ5: アプリの説明文

### アプリ名
```
NET CITY β
```

### サブタイトル（30文字以内）
```
リアルタイムチャットアプリ
```

### 説明文（4000文字以内）
```
NET CITY β - みんながつながる仮想の街

未来的な街の雰囲気の中で、リアルタイムにチャットを楽しめるアプリです。

【主な機能】
• リアルタイムチャット - 送信したメッセージが即座に反映
• シンプルなUI - 誰でも簡単に使える直感的なデザイン
• オンライン人数表示 - 今何人が街にいるか一目でわかる
• 未来的な背景 - サイバーパンク風の街並みが雰囲気を演出

【使い方】
1. 名前を入力して入場
2. メッセージを入力して送信
3. みんなとリアルタイムでチャット！

【こんな人におすすめ】
• 気軽にチャットを楽しみたい人
• 新しい人とつながりたい人
• シンプルなチャットアプリを探している人

登録不要で今すぐ始められます。
みんなで楽しいチャットの時間を過ごしましょう！

※メッセージは7日間保存され、その後自動削除されます。
```

### キーワード（100文字以内、カンマ区切り）
```
チャット,リアルタイム,オンライン,ソーシャル,コミュニケーション,メッセージ,トーク,掲示板
```

### サポートURL
```
https://github.com/koukiniwa/net-city-beta
```

### マーケティングURL（任意）
```
https://koukiniwa.github.io/net-city-beta/
```

---

## 🔐 ステップ6: プライバシーポリシーの作成

プライバシーポリシーは**必須**です。`privacy.html` として作成します。

---

## 🚀 ステップ7: アプリのアップロード

### 7-1. Archiveの作成
1. Xcodeで実機またはGeneric iOS Deviceを選択
2. メニュー: **Product** → **Archive**
3. ビルドが完了するまで待つ（数分）
4. Organizerウィンドウが自動的に開く

### 7-2. App Store Connect にアップロード
1. Organizerで作成したArchiveを選択
2. **Distribute App** をクリック
3. **App Store Connect** を選択
4. **Upload** を選択
5. 自動で設定を進める（デフォルトでOK）
6. **Upload** をクリック
7. アップロード完了まで待つ（数分〜10分）

### 7-3. App Store Connect で確認
1. App Store Connect にアクセス
2. 「マイApp」→「NET CITY β」
3. 「ビルド」セクションにアップロードしたビルドが表示される
   - ※処理中の場合は10〜15分待つ

---

## ✅ ステップ8: 審査に提出

### 8-1. バージョン情報を完成させる
1. App Store Connect の「NET CITY β」を開く
2. 左側の「1.0 審査待ち」をクリック
3. すべての必須項目を入力:
   - スクリーンショット（各デバイスサイズ）
   - 説明文
   - キーワード
   - サポートURL
   - プライバシーポリシーURL
   - ビルドを選択

### 8-2. 年齢制限・コンテンツ権利
- 年齢制限の質問に回答
- コンテンツ権利情報を確認

### 8-3. App Review 情報
- **連絡先情報**: メールアドレス、電話番号
- **レビュー用メモ**: テスト用の情報（あれば）
  ```
  このアプリは匿名のリアルタイムチャットアプリです。
  名前を入力するだけで誰でも利用できます。
  不適切なメッセージは手動でモデレーションする予定です。
  ```

### 8-4. 審査に提出
1. すべての項目が完了したら
2. 右上の「審査に提出」をクリック
3. 確認して送信

---

## ⏱️ ステップ9: 審査を待つ

### 審査期間
- 通常: 1〜3日
- 混雑時: 最大1週間

### 審査ステータス
- **審査待ち**: 順番待ち
- **審査中**: Appleが審査中
- **承認済み**: 審査通過！
- **却下**: 修正が必要

### 承認されたら
- **手動リリース**を選択した場合: 「リリース」ボタンをクリック
- **自動リリース**の場合: 自動的にApp Storeに公開

---

## 🐛 審査で却下される可能性がある点

### 1. プライバシーポリシーがない
→ 必ず作成してURLを登録

### 2. 不適切なコンテンツのモデレーション
→ ユーザー生成コンテンツがあるため、通報機能やモデレーション計画を説明

### 3. アプリが動作しない
→ 事前に実機でしっかりテスト

### 4. 機能が少なすぎる
→ 基本的なチャット機能があるので問題ないはず

---

## 🔄 アップデートの方法

### バージョンアップ時
1. Xcodeで **Version** と **Build** を更新
   - Version: 1.0.0 → 1.1.0
   - Build: 1 → 2
2. 新しいArchiveを作成
3. App Store Connect にアップロード
4. 新しいバージョンを作成して審査に提出

---

## 📊 公開後の運用

### App Store Connect でできること
- ダウンロード数の確認
- ユーザーレビューの閲覧と返信
- クラッシュレポートの確認
- 売上レポート（有料アプリの場合）

### アプリの改善
- ユーザーレビューをチェック
- クラッシュを修正
- 新機能を追加
- 定期的にアップデート

---

## 💡 Tips

### スクリーンショットの撮り方
```bash
# Xcodeシミュレータで起動
npm run open:ios

# シミュレータで: Command + S
# または メニュー: File → New Screen Shot
```

### ビルドが失敗する場合
```bash
# クリーンビルド
cd ios/App
pod deintegrate
pod install
cd ../..
npm run sync:ios

# Xcodeで: Product → Clean Build Folder
```

### Bundle ID を変更したい場合
1. `capacitor.config.json` の `appId` を変更
2. `capacitor.config.ts` の `appId` を変更
3. Xcodeのプロジェクト設定で Bundle Identifier を変更
4. App Store Connect で新しい Bundle ID を登録

---

## 📞 サポート

### 問題が発生したら
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [App Store Connect ヘルプ](https://help.apple.com/app-store-connect/)
- [Capacitor ドキュメント](https://capacitorjs.com/docs/ios)

---

## ✅ 公開完了！

おめでとうございます！
App Store でアプリが公開されました。

次のステップ:
1. SNSでアプリを宣伝
2. ユーザーのフィードバックを収集
3. 定期的にアップデートをリリース
4. アプリの改善を続ける

---

**注意**: App Store の審査ガイドラインは定期的に更新されます。
最新情報は [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) を確認してください。
