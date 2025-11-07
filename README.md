# NET CITY β 🌃

**みんながつながる仮想の街 - リアルタイムチャットアプリ**

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fkoukiniwa.github.io%2Fnet-city-beta%2F)](https://koukiniwa.github.io/net-city-beta/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 概要

NET CITY βは、ブラウザで動くリアルタイムチャットアプリケーションです。未来的な街の雰囲気の中で、世界中の人とチャットを楽しめます。

**🌐 デモサイト**: [https://koukiniwa.github.io/net-city-beta/](https://koukiniwa.github.io/net-city-beta/)

## ✨ 特徴

- 🚀 **リアルタイムチャット** - Firebase Realtime Databaseを使用
- 🎨 **未来的なデザイン** - 黒を基調としたネオン風UI
- 👥 **オンライン人数表示** - 今誰がいるかリアルタイムで分かる
- 📱 **マルチプラットフォーム** - Web、iOS、Android対応
- 🔒 **セキュア** - Firebaseセキュリティルールで保護
- 🆓 **無料・登録不要** - 名前を入力するだけですぐに使える
- 🗑️ **自動削除** - メッセージは7日後に自動削除

## 🛠️ 使用技術

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Firebase Realtime Database
- **ホスティング**: GitHub Pages
- **モバイルアプリ**: Capacitor (iOS/Android)
- **デザイン**: グラスモーフィズム、ネオンエフェクト

## 🚀 使い方

### Web版
1. [NET CITY β](https://koukiniwa.github.io/net-city-beta/) にアクセス
2. 名前を入力（2〜20文字）
3. 「入場する」をクリック
4. チャットを楽しもう！

### モバイルアプリ版
- **iOS**: App Store からダウンロード（準備中）
- **Android**: Google Play からダウンロード（準備中）

## 📂 ファイル構成

```
net-city-beta/
├── index.html                # 入場画面
├── city.html                 # チャット画面
├── css/                      # スタイルシート
├── js/                       # JavaScript
├── icons/                    # アプリアイコン
├── privacy.html              # プライバシーポリシー
├── manifest.json             # PWAマニフェスト
├── service-worker.js         # Service Worker
├── docs/                     # ドキュメント
│   ├── development/         # 開発ガイド
│   ├── deployment/          # デプロイガイド
│   ├── marketing/           # マーケティングガイド
│   └── specifications/      # 仕様書
├── scripts/                  # ビルドスクリプト
├── tools/                    # 管理ツール
├── android/                  # Androidネイティブプロジェクト
├── ios/                      # iOSネイティブプロジェクト
├── www/                      # Capacitorビルド出力（自動生成）
├── resources/                # アイコン・スプラッシュ画像
├── capacitor.config.ts       # Capacitor設定
├── package.json              # npm設定
├── README.md                 # このファイル
└── SECURITY.md               # セキュリティポリシー
```

## 🔧 開発環境のセットアップ

### Web版の開発
```bash
# リポジトリをクローン
git clone https://github.com/koukiniwa/net-city-beta.git

# フォルダに移動
cd net-city-beta

# index.htmlをブラウザで開く
# （Live Serverなどの拡張機能を使うと便利です）
```

### モバイルアプリのビルド
```bash
# 依存関係をインストール
npm install

# アイコンとスプラッシュを生成
npm run assets

# iOSアプリをビルド（Macのみ）
npm run sync:ios
npm run open:ios

# Androidアプリをビルド
npm run sync:android
npm run open:android
```

詳細は以下のドキュメントを参照:
- [アプリビルドガイド](./docs/development/CAPACITOR_BUILD.md)
- [App Store公開ガイド](./docs/deployment/APP_STORE_PUBLISHING.md)
- [公開チェックリスト](./docs/deployment/APP_STORE_CHECKLIST.md)

## 🎨 機能

### 入場画面
- ネオン風タイトルアニメーション
- 名前のバリデーション（2〜20文字）
- Enter キーで入場可能

### チャット画面
- 未来的な街の背景（光る建物のシルエット）
- リアルタイムメッセージ表示
- 自分と他人のメッセージを色分け
- タイムスタンプ表示
- オンライン人数のリアルタイム表示
- 自動スクロール

## 🔒 セキュリティ

- Firebaseセキュリティルールで不正データを防止
- メッセージは500文字まで
- XSS対策（HTMLエスケープ処理）

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 👤 作者

**koukiniwa**

- GitHub: [@koukiniwa](https://github.com/koukiniwa)
- Website: [https://koukiniwa.github.io/net-city-beta/](https://koukiniwa.github.io/net-city-beta/)

## 🙏 謝辞

- Firebase for providing the real-time database
- GitHub Pages for free hosting

---

⭐ このプロジェクトが気に入ったら、スターをつけてください！
