@echo off
echo ==========================================
echo NET CITY Beta - APK �r���h�c�[��
echo ==========================================
echo.

REM JAVA_HOME��ݒ�
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/4] Java�m�F��...
java -version
if errorlevel 1 (
    echo.
    echo [�G���[] Java��������܂���B
    echo Android Studio���C���X�g�[������Ă��邩�m�F���Ă��������B
    pause
    exit /b 1
)

echo.
echo [2/4] Android�t�H���_�Ɉړ���...
cd /d "%~dp0android"

echo.
echo [3/4] APK�r���h�J�n...
echo �����5�`10��������܂��B���̂܂܂��҂���������...
echo.

gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo [�G���[] �r���h�Ɏ��s���܂����B
    echo �G���[���b�Z�[�W���m�F���Ă��������B
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [4/4] �r���h�����I
echo ==========================================
echo.
echo APK�t�@�C���̏ꏊ:
echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo APK�̂���t�H���_���J���܂����H
pause

explorer "%~dp0android\app\build\outputs\apk\debug"

echo.
echo �������܂����I
pause
