# NET CITY β - Capacitorアプリビルドガイド

## 📱 セットアップ完了

Capacitorを使用してiOS/Androidアプリに変換できる環境が整いました！

## 🏗️ プロジェクト構造

```
new city/
├── www/              # Webアプリのソースコード（ビルド出力）
├── android/          # Androidネイティブプロジェクト
├── ios/              # iOSネイティブプロジェクト
├── resources/        # アイコン・スプラッシュ画像の元ファイル
└── icons/            # 生成されたPWAアイコン
```

## 🔧 利用可能なコマンド

### Webアプリの変更を同期
```bash
npm run sync          # すべてのプラットフォームに同期
npm run sync:android  # Androidのみ同期
npm run sync:ios      # iOSのみ同期
```

### アイコン・スプラッシュスクリーン生成
```bash
npm run assets        # アイコンとスプラッシュを自動生成
```

### ネイティブIDEを開く
```bash
npm run open:android  # Android Studio を開く
npm run open:ios      # Xcode を開く（macOSのみ）
```

## 📦 Androidアプリのビルド方法

### 必要なもの
- Android Studio
- Java Development Kit (JDK) 17以上

### ビルド手順
1. Android Studioを開く
   ```bash
   npm run open:android
   ```

2. Android Studioで:
   - `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)` を選択
   - または `Build` → `Generate Signed Bundle / APK` でリリースビルド

3. APKファイルの場所
   - デバッグ版: `android/app/build/outputs/apk/debug/app-debug.apk`
   - リリース版: `android/app/build/outputs/apk/release/app-release.apk`

### Google Playストアへの公開（リリース版）
1. Android Studioで `Build` → `Generate Signed Bundle / APK`
2. `Android App Bundle` を選択
3. キーストアを作成（初回のみ）
4. 生成されたAABファイルをGoogle Play Consoleにアップロード

## 🍎 iOSアプリのビルド方法

### 必要なもの
- macOS
- Xcode 14以上
- Apple Developer アカウント（ストア公開する場合）

### ビルド手順
1. CocoaPodsをインストール（初回のみ）
   ```bash
   sudo gem install cocoapods
   ```

2. iOSの依存関係をインストール
   ```bash
   cd ios/App
   pod install
   ```

3. Xcodeを開く
   ```bash
   npm run open:ios
   ```

4. Xcodeで:
   - チームを選択（Apple Developer アカウント）
   - シミュレータまたは実機を選択
   - `Product` → `Build` でビルド
   - `Product` → `Archive` でリリースビルド

### App Storeへの公開
1. Xcodeで `Product` → `Archive`
2. Organizer が開いたら `Distribute App` を選択
3. App Store Connect にアップロード

## 🔄 Webアプリの更新をアプリに反映

1. `www/` ディレクトリ内のファイルを編集
2. 変更を同期
   ```bash
   npm run sync
   ```
3. ネイティブIDEで再ビルド

## 📝 重要な設定ファイル

- `capacitor.config.json` - Capacitorの設定
- `package.json` - npm スクリプトと依存関係
- `android/app/build.gradle` - Androidビルド設定
- `ios/App/App.xcodeproj` - iOSプロジェクト設定

## 🎨 アイコン・スプラッシュの更新

1. `resources/icon.png` と `resources/splash.png` を更新
   - icon.png: 1024x1024px 推奨
   - splash.png: 2732x2732px 推奨

2. アセットを再生成
   ```bash
   npm run assets
   # または直接コマンド
   # npx capacitor-assets generate --iconBackgroundColor '#0a0e27' --splashBackgroundColor '#0a0e27'
   ```

3. 同期
   ```bash
   npm run sync
   ```

## 🐛 トラブルシューティング

### Android Studioが見つからない
```bash
# 環境変数を設定
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
```

### iOSビルドエラー
```bash
cd ios/App
pod deintegrate
pod install
```

### 変更が反映されない
```bash
# クリーンビルド
npx cap sync --clean
```

## 📚 参考リンク

- [Capacitor公式ドキュメント](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)

## ✅ 次のステップ

1. **開発**: `www/` のファイルを編集してアプリを開発
2. **テスト**: シミュレータ/エミュレータでテスト
3. **ビルド**: 上記の手順でAPK/IPAを生成
4. **公開**: Google Play / App Store に公開

---

**注意**: 初めてアプリをビルドする場合は、Android Studio または Xcode を使ってビルド設定を確認してください。
