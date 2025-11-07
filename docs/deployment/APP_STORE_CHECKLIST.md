# NET CITY β - App Store 提出チェックリスト

このチェックリストを使って、App Store提出前にすべての準備が整っているか確認してください。

---

## ✅ 事前準備

### Apple Developer Program
- [ ] Apple Developer Program に登録済み（年間 $99 USD）
- [ ] 登録が承認された（メールで通知）
- [ ] Apple Developer アカウントでサインインできる

### 開発環境
- [ ] Mac コンピュータがある
- [ ] 最新版の Xcode がインストールされている
- [ ] Xcode を開いて Apple ID でサインインした
- [ ] CocoaPods がインストールされている（`sudo gem install cocoapods`）

---

## 📱 アプリの準備

### プロジェクトの同期
```bash
cd "/mnt/c/Users/kouki/OneDrive/デスクトップ/new city"
```

- [ ] `npm install` でパッケージをインストール
- [ ] `npm run assets` でアイコン・スプラッシュを生成
- [ ] `npm run sync:ios` で iOS プロジェクトに同期
- [ ] `cd ios/App && pod install && cd ../..` で CocoaPods をインストール

### Xcode プロジェクト設定
- [ ] `npm run open:ios` で Xcode を開く
- [ ] **General** タブで以下を確認:
  - [ ] Bundle Identifier: `com.netcity.app`
  - [ ] Display Name: `NET CITY β`
  - [ ] Version: `1.0.0`
  - [ ] Build: `1`
  - [ ] Deployment Target: iOS 13.0 以上
- [ ] **Signing & Capabilities** タブで:
  - [ ] "Automatically manage signing" にチェック
  - [ ] Team で Apple Developer アカウントを選択
  - [ ] Provisioning Profile が自動生成されていることを確認

### アプリのテスト
- [ ] シミュレータで起動して動作確認
- [ ] 実機でテストして動作確認
- [ ] チャット機能が正常に動作する
- [ ] メッセージ送信ができる
- [ ] オンライン人数が表示される
- [ ] クラッシュしない

---

## 🎨 App Store Connect の準備

### App Store Connect にアクセス
- [ ] [App Store Connect](https://appstoreconnect.apple.com/) にアクセス
- [ ] Apple Developer アカウントでサインイン

### 新規アプリを作成
- [ ] 「マイApp」→「+」→「新規App」をクリック
- [ ] 以下を入力:
  - [ ] プラットフォーム: iOS
  - [ ] 名前: `NET CITY β`
  - [ ] 主要言語: 日本語
  - [ ] バンドルID: `com.netcity.app`
  - [ ] SKU: `netcity-beta-001`（任意の一意な文字列）
  - [ ] ユーザーアクセス: フルアクセス

---

## 📝 App 情報の入力

### 基本情報
- [ ] **カテゴリ**: ソーシャルネットワーキング
- [ ] **価格**: 無料
- [ ] **プライバシーポリシーURL**: `https://koukiniwa.github.io/net-city-beta/privacy.html`
- [ ] **年齢制限**: 4+（チャット機能に注意）

### アプリの説明
- [ ] **アプリ名**: NET CITY β
- [ ] **サブタイトル**: リアルタイムチャットアプリ
- [ ] **説明文**: 用意したテキストを貼り付け（`APP_STORE_PUBLISHING.md` 参照）
- [ ] **キーワード**: チャット,リアルタイム,オンライン,ソーシャル,コミュニケーション,メッセージ,トーク,掲示板
- [ ] **サポートURL**: `https://github.com/koukiniwa/net-city-beta`
- [ ] **マーケティングURL**: `https://koukiniwa.github.io/net-city-beta/`

---

## 🖼️ スクリーンショットの準備

### 必要なスクリーンショット
- [ ] **iPhone 6.9インチ** (iPhone 16 Pro Max): 1320 x 2868px - 最低1枚
- [ ] **iPhone 6.7インチ** (iPhone 15 Pro Max): 1290 x 2796px - 最低1枚
- [ ] **iPhone 6.5インチ** (iPhone 11 Pro Max): 1242 x 2688px - 最低1枚
- [ ] **iPad Pro 13インチ**: 2064 x 2752px - 最低1枚（iPad対応の場合）

### スクリーンショット撮影方法
1. Xcode シミュレータで該当デバイスを選択
2. アプリを起動
3. `Command + S` でスクリーンショット
4. 入場画面、チャット画面など、主要な画面を撮影

### App アイコン
- [ ] 1024 x 1024px の PNG アイコンを準備
- [ ] 透明背景なし
- [ ] `resources/icon.png` を使用可能

---

## 🚀 アプリのビルドとアップロード

### Archive の作成
- [ ] Xcode で Generic iOS Device または実機を選択
- [ ] メニュー: **Product** → **Archive**
- [ ] ビルド成功（エラーがない）
- [ ] Organizer が開く

### App Store Connect にアップロード
- [ ] Organizer で Archive を選択
- [ ] **Distribute App** をクリック
- [ ] **App Store Connect** を選択
- [ ] **Upload** を選択
- [ ] デフォルト設定で進める
- [ ] **Upload** をクリック
- [ ] アップロード完了を待つ（5〜10分）

### App Store Connect で確認
- [ ] App Store Connect の「マイApp」を開く
- [ ] 「NET CITY β」を選択
- [ ] 「ビルド」セクションにアップロードしたビルドが表示される
  - ※表示されない場合は10〜15分待つ

---

## 📋 審査提出

### バージョン情報の完成
- [ ] App Store Connect で「1.0 審査待ち」をクリック
- [ ] すべての必須項目が入力されている:
  - [ ] スクリーンショット（各デバイスサイズ）
  - [ ] 説明文
  - [ ] キーワード
  - [ ] サポートURL
  - [ ] プライバシーポリシーURL
  - [ ] ビルドを選択

### 年齢制限・コンテンツ
- [ ] 年齢制限の質問に回答
- [ ] コンテンツ権利情報を確認
- [ ] 暴力・性的コンテンツなどの質問に回答

### App Review 情報
- [ ] **連絡先情報**: メールアドレス、電話番号を入力
- [ ] **レビュー用メモ**: テスト情報を記入
  ```
  このアプリは匿名のリアルタイムチャットアプリです。
  名前を入力するだけで誰でも利用できます。
  不適切なメッセージは手動でモデレーションする予定です。
  ```

### 輸出コンプライアンス
- [ ] 暗号化の使用について回答（HTTPSのみの場合は「いいえ」）

### 広告識別子（IDFA）
- [ ] 広告識別子を使用するか回答（このアプリは使用しない）

### 最終確認
- [ ] すべての項目が緑のチェックマークになっている
- [ ] エラーや警告がない
- [ ] 右上の「審査に提出」ボタンが有効になっている

### 審査に提出
- [ ] 「審査に提出」をクリック
- [ ] 確認ダイアログで「送信」をクリック
- [ ] ステータスが「審査待ち」になる

---

## ⏱️ 審査待ち

### 審査期間
- 通常: 1〜3日
- 混雑時: 最大1週間

### 審査ステータスの確認
- [ ] App Store Connect で定期的にステータスを確認
- [ ] メール通知を確認

### 考えられるステータス
- **審査待ち**: 順番待ち
- **審査中**: Apple が審査中
- **承認済み**: 🎉 審査通過！
- **却下**: 修正が必要（理由を確認して再提出）

---

## 🎉 承認後

### リリース
- [ ] ステータスが「承認済み」になった
- [ ] 手動リリースを選択した場合: 「リリース」ボタンをクリック
- [ ] 自動リリースの場合: 自動的に公開される

### 公開確認
- [ ] App Store でアプリを検索
- [ ] ダウンロードできることを確認
- [ ] 実機でダウンロードしてテスト

### 宣伝
- [ ] SNS でアプリを告知
- [ ] GitHub の README に App Store リンクを追加
- [ ] ウェブサイトに App Store バッジを追加

---

## 🐛 トラブルシューティング

### ビルドが失敗する
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npm run sync:ios

# Xcode で: Product → Clean Build Folder
```

### Archive が作成できない
- [ ] デバイスが「Generic iOS Device」になっているか確認
- [ ] Signing が正しく設定されているか確認
- [ ] エラーメッセージを確認して対処

### アップロードが失敗する
- [ ] インターネット接続を確認
- [ ] Xcode と macOS が最新版か確認
- [ ] Apple Developer アカウントが有効か確認

### 審査で却下された
- [ ] 却下理由をよく読む
- [ ] 必要な修正を行う
- [ ] 再度ビルドして提出

---

## 📞 サポートリソース

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect ヘルプ](https://help.apple.com/app-store-connect/)
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Capacitor iOS ドキュメント](https://capacitorjs.com/docs/ios)

---

## 🎊 成功！

すべてのチェック項目が完了したら、おめでとうございます！
NET CITY β が App Store で公開されます。

次のステップ:
1. ユーザーからのフィードバックを収集
2. レビューに返信
3. 定期的にアップデートをリリース
4. アプリの改善を続ける

---

**最終チェック日**: _______________

**提出者**: _______________

**ステータス**: [ ] 準備中 / [ ] 提出済み / [ ] 承認済み / [ ] 公開済み
