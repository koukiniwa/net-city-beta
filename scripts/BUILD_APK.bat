@echo off
echo ==========================================
echo NET CITY Beta - APK ビルドツール
echo ==========================================
echo.

REM JAVA_HOMEを設定
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/4] Java確認中...
java -version
if errorlevel 1 (
    echo.
    echo [エラー] Javaが見つかりません。
    echo Android Studioがインストールされているか確認してください。
    pause
    exit /b 1
)

echo.
echo [2/4] Androidフォルダに移動中...
cd /d "%~dp0android"

echo.
echo [3/4] APKビルド開始...
echo 初回は5～10分かかります。そのままお待ちください...
echo.

gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo [エラー] ビルドに失敗しました。
    echo エラーメッセージを確認してください。
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [4/4] ビルド完了！
echo ==========================================
echo.
echo APKファイルの場所:
echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo APKのあるフォルダを開きますか？
pause

explorer "%~dp0android\app\build\outputs\apk\debug"

echo.
echo 完了しました！
pause
