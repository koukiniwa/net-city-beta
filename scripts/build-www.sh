#!/bin/bash
# Capacitorビルド用に www/ ディレクトリを作成するスクリプト

echo "🔨 www/ ディレクトリをビルド中..."

# www/ ディレクトリを削除して再作成
rm -rf www/
mkdir -p www/

# 必要なファイルをコピー
echo "📦 ファイルをコピー中..."

# HTML ファイル
cp index.html www/
cp -r html/ www/html/

# CSS ディレクトリ
cp -r css/ www/css/

# JS ディレクトリ
cp -r js/ www/js/

# アイコン類
cp -r icons/ www/icons/
cp icon.svg www/

# PWA 関連
cp manifest.json www/
cp service-worker.js www/

echo "✅ www/ ディレクトリのビルドが完了しました！"
