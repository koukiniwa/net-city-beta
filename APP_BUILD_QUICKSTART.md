# NET CITY β - スマホアプリ化クイックスタート

## 🚀 最速でスマホアプリにする方法

### Android版（Windows/Mac/Linux）

#### 1. 準備
```bash
# Android Studioをインストール
# https://developer.android.com/studio からダウンロード

# 必要なパッケージをインストール
npm install
```

#### 2. アイコン・スプラッシュ生成（任意）
```bash
npm run assets
```

#### 3. Androidプロジェクトに同期
```bash
npm run sync:android
```

#### 4. Android Studioで開く
```bash
npm run open:android
```

#### 5. ビルド
Android Studioで:
- メニュー: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
- 完成したAPKは `android/app/build/outputs/apk/debug/app-debug.apk`

#### 6. スマホにインストール
- USBでスマホを接続してUSBデバッグを有効化
- Android Studioの▶ボタンでインストール
- またはAPKファイルを直接スマホに転送してインストール

---

### iOS版（Macのみ）

#### 1. 準備
```bash
# Xcodeをインストール（App Storeから）
# CocoaPodsをインストール
sudo gem install cocoapods

# 必要なパッケージをインストール
npm install
```

#### 2. アイコン・スプラッシュ生成（任意）
```bash
npm run assets
```

#### 3. iOSプロジェクトに同期
```bash
npm run sync:ios
```

#### 4. CocoaPods設定
```bash
cd ios/App
pod install
cd ../..
```

#### 5. Xcodeで開く
```bash
npm run open:ios
```

#### 6. ビルド
Xcodeで:
- チーム設定（Apple IDでサインイン）
- シミュレータまたは実機を選択
- ▶ボタンでビルド&実行

---

## 📝 HTMLファイルを更新した後

```bash
# 1. wwwフォルダにコピー（既に同じファイルがある場合はスキップ）
# cp index.html www/
# cp city.html www/
# cp -r css www/
# cp -r js www/

# 2. 変更を同期
npm run sync

# 3. Android StudioまたはXcodeで再ビルド
```

---

## 🎯 重要なポイント

### wwwディレクトリ
- アプリのソースは `www/` ディレクトリにあるファイルです
- HTMLを更新したら `www/` 内のファイルを更新してください
- その後 `npm run sync` で反映されます

### Firebase設定
- `www/city.html` のFirebase設定がそのまま使われます
- Web版と同じデータベースに接続されます

### 開発の流れ
1. `www/` 内のファイルを編集
2. `npm run sync` で同期
3. Android Studio / Xcodeで実行して確認
4. 問題なければビルド

---

## 🐛 よくあるエラー

### "Capacitorが見つからない"
```bash
npm install
```

### "Android Studioが開かない"
- Android Studioがインストールされているか確認
- 環境変数PATHにAndroid Studioのパスが含まれているか確認

### "iOSビルドエラー"
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npm run sync:ios
```

### "変更が反映されない"
```bash
# クリーンして再同期
npx cap sync --clean
```

---

## 📱 テスト方法

### Androidエミュレータ
1. Android Studioで `AVD Manager` を開く
2. 仮想デバイスを作成
3. ▶ボタンでアプリを実行

### iOSシミュレータ
1. Xcodeでシミュレータを選択
2. ▶ボタンでアプリを実行

### 実機テスト
- **Android**: USBデバッグを有効化して接続
- **iOS**: Apple Developer登録が必要（無料版でもOK）

---

## 🎉 完成したら

### Google Playストアに公開
1. Google Play Console アカウント作成（$25の登録料）
2. Android Studioで署名付きAABを生成
3. Google Play Console にアップロード

### App Storeに公開
1. Apple Developer Program 登録（年間$99）
2. Xcodeで Archive を作成
3. App Store Connect にアップロード

---

## 📚 詳細情報
詳しい手順は `CAPACITOR_BUILD.md` を参照してください。
