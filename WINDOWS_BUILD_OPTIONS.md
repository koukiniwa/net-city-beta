# NET CITY β - Windowsでアプリをビルドする方法

Windowsユーザー向けに、iOSアプリとAndroidアプリをビルドする方法を説明します。

---

## 🎯 結論：おすすめの方法

### ✅ 今すぐできる: Androidアプリをビルド
Windowsでは**Androidアプリ**を簡単にビルドできます。
- Android Studio を使って無料でビルド可能
- Google Play ストアに公開できる
- 所要時間: 1〜2時間

### 🍎 iOSアプリをビルドする選択肢

| 方法 | 費用 | 難易度 | おすすめ度 |
|------|------|--------|------------|
| **クラウドビルドサービス** | 無料〜$40/月 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **友人・知人のMacを借りる** | 無料 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **レンタルMacサービス** | $30〜/月 | ⭐⭐ | ⭐⭐⭐ |
| **中古Macを購入** | $200〜 | ⭐ | ⭐⭐⭐ |
| **仮想マシン（非推奨）** | 無料 | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 📱 方法1: Androidアプリをビルド（推奨）

WindowsではAndroidアプリを簡単にビルドできます。

### 必要なもの
- Windows 10/11
- Android Studio
- 約10GBの空き容量

### 手順

#### 1. Android Studioをインストール
1. [Android Studio](https://developer.android.com/studio) からダウンロード
2. インストーラーを実行
3. すべてデフォルト設定でインストール
4. 初回起動時に必要なSDKが自動インストールされる

#### 2. プロジェクトの準備
```bash
# プロジェクトフォルダに移動
cd "C:\Users\kouki\OneDrive\デスクトップ\new city"

# 依存関係をインストール
npm install

# アイコンとスプラッシュを生成
npm run assets

# Androidプロジェクトに同期
npm run sync:android
```

#### 3. Android Studioで開く
```bash
# Android Studioを起動
npm run open:android
```

または、Android Studioを手動で起動して:
- `File` → `Open`
- `C:\Users\kouki\OneDrive\デスクトップ\new city\android` を選択

#### 4. 初回ビルド（Gradleの設定）
- Android Studioが開いたら、自動的にGradleの同期が始まる
- 初回は5〜10分かかる場合がある
- エラーが出たら「Sync Project with Gradle Files」をクリック

#### 5. APKをビルド
1. メニュー: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. ビルド完了まで待つ（2〜5分）
3. 完成したAPK: `android\app\build\outputs\apk\debug\app-debug.apk`

#### 6. スマホにインストール
**方法A: USBケーブルで接続**
1. スマホの設定で「開発者向けオプション」を有効化
2. 「USBデバッグ」を有効化
3. USBでPCに接続
4. Android Studioの▶ボタンでインストール

**方法B: APKファイルを転送**
1. APKファイルをスマホに転送（メール、Dropbox、USBなど）
2. スマホでAPKファイルを開く
3. 「提供元不明のアプリ」のインストールを許可
4. インストール

### Google Play ストアに公開
詳細は `GOOGLE_PLAY_PUBLISHING.md` を参照（後述）

---

## ☁️ 方法2: クラウドビルドサービスを使う（おすすめ）

クラウドサービスを使えば、WindowsからiOSアプリをビルドできます。

### おすすめサービス

#### 1. **Ionic Appflow**（無料プランあり）
- **料金**: 無料プラン / $29/月〜
- **特徴**: Capacitorアプリに最適化
- **手順**:
  1. [Ionic Appflow](https://ionic.io/appflow) でアカウント作成
  2. プロジェクトをGitHubにプッシュ
  3. Appflowでプロジェクトをインポート
  4. クラウドでiOSビルドを実行
  5. IPAファイルをダウンロード
  6. App Store Connect にアップロード

#### 2. **Codemagic**（無料プランあり）
- **料金**: 無料 500分/月 / $49/月〜
- **特徴**: GUIで簡単設定
- **手順**:
  1. [Codemagic](https://codemagic.io/) でアカウント作成
  2. GitHubリポジトリを連携
  3. Capacitor iOS を選択
  4. Apple Developer 証明書を設定
  5. ビルドを実行
  6. IPAファイルを自動でApp Store Connectに送信可能

#### 3. **EAS Build (Expo)**
- **料金**: 無料プラン / $29/月〜
- **特徴**: React Native/Capacitor対応
- **手順**:
  1. [Expo](https://expo.dev/) でアカウント作成
  2. `npm install -g eas-cli`
  3. `eas build --platform ios`
  4. クラウドでビルド
  5. IPAをダウンロード

### クラウドビルドの設定方法（Codemagic例）

```bash
# 1. GitHubにプロジェクトをプッシュ
cd "C:\Users\kouki\OneDrive\デスクトップ\new city"
git add .
git commit -m "iOS build準備"
git push

# 2. Codemagicにアクセス
# https://codemagic.io/

# 3. GitHubで認証

# 4. プロジェクトを選択

# 5. ビルド設定
# - Platform: iOS
# - Framework: Capacitor
# - Xcode version: 最新

# 6. Apple Developer 証明書をアップロード
# - App Store Connect API Key
# - または証明書を手動でアップロード

# 7. ビルド開始
```

---

## 🖥️ 方法3: レンタルMacサービス

リモートでMacにアクセスして、実際のMacでビルドできます。

### おすすめサービス

#### 1. **MacinCloud**
- **料金**: $30〜/月
- **URL**: https://www.macincloud.com/
- **特徴**:
  - 時間単位のプランもあり（$1/時間〜）
  - Xcodeがプリインストール
  - リモートデスクトップで操作

#### 2. **MacStadium**
- **料金**: $100〜/月
- **URL**: https://www.macstadium.com/
- **特徴**:
  - 専用Mac mini
  - 高性能

### 使い方
1. サービスに登録
2. リモートデスクトップで接続
3. 通常のMacと同じようにXcodeを使用
4. ビルドして App Store Connect にアップロード

---

## 👥 方法4: 友人・知人のMacを借りる

無料で最も確実な方法です。

### 必要なもの
- Macを持っている友人・知人
- 1〜2時間の時間

### 手順
1. プロジェクトをUSBメモリまたはGitHubで持参
2. 友人のMacにXcodeをインストール（時間がかかる場合あり）
3. プロジェクトを開いてビルド
4. Archive を作成して App Store Connect にアップロード

**注意**: Apple IDは自分のものを使用

---

## 🛒 方法5: 中古Macを購入

長期的にiOSアプリ開発を続けるなら、中古Macの購入を検討。

### おすすめの中古Mac
- **Mac mini (2018以降)**: $200〜$400
- **MacBook Air (2017以降)**: $300〜$600
- **購入先**: メルカリ、ヤフオク、ハードオフ、じゃんぱら

### 最低スペック
- macOS Big Sur (11.0) 以上
- 8GB RAM
- 100GB 空き容量

---

## ⚠️ 方法6: 仮想マシン（非推奨）

**注意**: Appleのライセンス違反になる可能性があり、おすすめしません。

理由:
- Appleのライセンス規約で、macOSはAppleハードウェアでのみ実行可能
- 動作が不安定
- ビルドが失敗しやすい
- App Store への提出で問題が発生する可能性

---

## 📊 各方法の比較

| 方法 | 初期費用 | 月額費用 | 所要時間 | 難易度 | おすすめ |
|------|----------|----------|----------|--------|----------|
| **Androidのみ** | 無料 | 無料 | 2時間 | ⭐ | ⭐⭐⭐⭐⭐ |
| **クラウドビルド** | 無料〜 | $0〜$50 | 1時間 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **友人のMac** | 無料 | 無料 | 2時間 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **レンタルMac** | 無料 | $30〜 | 2時間 | ⭐⭐ | ⭐⭐⭐ |
| **中古Mac購入** | $200〜 | 無料 | 1日 | ⭐ | ⭐⭐⭐ |
| **仮想マシン** | 無料 | 無料 | 1週間 | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 💡 おすすめの戦略

### 戦略1: まずAndroidで始める
1. **今すぐ**: Androidアプリをビルド
2. **Google Playで公開**: ユーザーの反応を見る
3. **人気が出たら**: iOSも追加（クラウドビルドまたはMac購入）

### 戦略2: 両方同時に公開
1. **Androidアプリ**: 自分でビルド（Windows）
2. **iOSアプリ**: クラウドビルドサービスを使用

### 戦略3: Web版を先に磨く
1. **PWA**として公開（既に対応済み）
2. ユーザーが増えてから、アプリ版を検討

---

## 🚀 次のステップ

### すぐにできること
1. **Androidアプリをビルド**
   - `ANDROID_BUILD_GUIDE.md` を参照（後述）
   - 所要時間: 1〜2時間

2. **クラウドビルドの無料プランを試す**
   - Codemagic または Ionic Appflow に登録
   - 無料枠でiOSビルドを試す

### 中長期的な選択肢
- ユーザーが増えたら中古Macの購入を検討
- 継続的に開発するならMacは便利

---

## 📚 関連ドキュメント

- [Androidビルドガイド](./ANDROID_BUILD_GUIDE.md) - 詳細な手順（次に作成）
- [Google Play公開ガイド](./GOOGLE_PLAY_PUBLISHING.md) - 公開手順（次に作成）
- [クラウドビルド設定ガイド](./CLOUD_BUILD_GUIDE.md) - 詳細設定

---

## 🎯 結論

**今すぐ始めるなら**: Androidアプリをビルドしましょう！

Windowsでも簡単にビルドでき、Google Play ストアで世界中に配信できます。
iOS版は、アプリが軌道に乗ってからクラウドビルドサービスやMac購入を検討するのがおすすめです。

次は `ANDROID_BUILD_GUIDE.md` を確認して、Androidアプリをビルドしてみましょう！
