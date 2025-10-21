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
- 📱 **レスポンシブ対応** - スマホでも快適に利用可能
- 🔒 **セキュア** - Firebaseセキュリティルールで保護
- 🆓 **無料・登録不要** - 名前を入力するだけですぐに使える

## 🛠️ 使用技術

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **バックエンド**: Firebase Realtime Database
- **ホスティング**: GitHub Pages
- **デザイン**: グラスモーフィズム、ネオンエフェクト

## 🚀 使い方

1. [NET CITY β](https://koukiniwa.github.io/net-city-beta/) にアクセス
2. 名前を入力（2〜20文字）
3. 「入場する」をクリック
4. チャットを楽しもう！

## 📂 ファイル構成

```
net-city-beta/
├── index.html          # 入場画面
├── city.html           # チャット画面
├── css/
│   ├── index.css       # 入場画面スタイル
│   └── city.css        # チャット画面スタイル
├── js/
│   ├── index.js        # 入場処理
│   └── city.js         # チャット機能
├── sitemap.xml         # サイトマップ
├── robots.txt          # クローラー設定
└── README.md           # このファイル
```

## 🔧 ローカル環境で動かす

```bash
# リポジトリをクローン
git clone https://github.com/koukiniwa/net-city-beta.git

# フォルダに移動
cd net-city-beta

# index.htmlをブラウザで開く
# （Live Serverなどの拡張機能を使うと便利です）
```

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
