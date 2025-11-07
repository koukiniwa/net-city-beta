@echo off
echo ==========================================
echo NET CITY Beta - APK確認ツール
echo ==========================================
echo.

set APK_PATH="%~dp0android\app\build\outputs\apk\debug\app-debug.apk"

if exist %APK_PATH% (
    echo [成功] APKファイルが見つかりました！
    echo.
    echo ファイルの場所:
    echo %APK_PATH%
    echo.
    dir %APK_PATH%
    echo.
    echo このAPKファイルをスマホにインストールできます。
    echo.
    echo APKのあるフォルダを開きますか？
    pause
    explorer "%~dp0android\app\build\outputs\apk\debug"
) else (
    echo [エラー] APKファイルが見つかりません。
    echo.
    echo まだビルドが完了していない可能性があります。
    echo 以下のコマンドでビルドを実行してください:
    echo.
    echo   cd android
    echo   gradlew.bat assembleDebug
    echo.
)

pause
