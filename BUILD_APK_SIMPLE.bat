@echo off
echo ==========================================
echo NET CITY Beta - APK Build Tool
echo ==========================================
echo.

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/4] Checking Java...
java -version
if errorlevel 1 (
    echo.
    echo ERROR: Java not found
    pause
    exit /b 1
)

echo.
echo [2/4] Moving to Android folder...
cd /d "%~dp0android"

echo.
echo [3/4] Building APK...
echo This will take 5-10 minutes. Please wait...
echo.

gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [4/4] Build Complete!
echo ==========================================
echo.
echo APK Location:
echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause

explorer "%~dp0android\app\build\outputs\apk\debug"
