// ========================================
// 入場画面の処理
// ========================================

// ページが読み込まれたら実行される
document.addEventListener('DOMContentLoaded', function() {

    // HTML要素を取得（IDで指定）
    const usernameInput = document.getElementById('username'); // 名前入力欄
    const enterButton = document.getElementById('enterButton'); // 入場ボタン
    const errorMessage = document.getElementById('errorMessage'); // エラーメッセージ

    // ========================================
    // Enterキーで入場できるようにする
    // ========================================
    usernameInput.addEventListener('keypress', function(event) {
        // Enterキーが押されたかチェック（キーコード13）
        if (event.key === 'Enter') {
            handleEnter(); // 入場処理を実行
        }
    });

    // ========================================
    // ボタンをクリックした時の処理
    // ========================================
    enterButton.addEventListener('click', function() {
        handleEnter(); // 入場処理を実行
    });

    // ========================================
    // 入場処理の関数
    // ========================================
    function handleEnter() {
        // 入力された名前を取得（前後の空白を削除）
        const username = usernameInput.value.trim();

        // ========================================
        // バリデーション（入力チェック）
        // ========================================

        // 名前が空の場合
        if (username === '') {
            showError('名前を入力してください'); // エラーを表示
            return; // ここで処理を終了
        }

        // 名前が2文字未満の場合
        if (username.length < 2) {
            showError('名前は2文字以上で入力してください');
            return;
        }

        // 名前が20文字より長い場合
        if (username.length > 20) {
            showError('名前は20文字以内で入力してください');
            return;
        }

        // ========================================
        // 入力がOKなら、名前を保存して街へ移動
        // ========================================

        // localStorageに名前を保存（ブラウザに記憶）
        // これで別のページ（city.html）でも名前が使える
        localStorage.setItem('netcity_username', username);

        // city.htmlへ移動
        window.location.href = 'city.html';
    }

    // ========================================
    // エラーメッセージを表示する関数
    // ========================================
    function showError(message) {
        errorMessage.textContent = message; // エラー文を表示

        // 入力欄を赤く光らせる
        usernameInput.style.borderColor = '#ff3366';
        usernameInput.style.boxShadow = '0 0 15px rgba(255, 51, 102, 0.5)';

        // 3秒後にエラーを消す
        setTimeout(function() {
            errorMessage.textContent = ''; // エラー文を消す
            usernameInput.style.borderColor = 'rgba(0, 255, 255, 0.3)'; // 元の色に戻す
            usernameInput.style.boxShadow = 'none'; // 影を消す
        }, 3000); // 3000ミリ秒 = 3秒
    }

    // ========================================
    // 入力中にエラーをクリアする
    // ========================================
    usernameInput.addEventListener('input', function() {
        // 何か入力されたらエラーメッセージを消す
        errorMessage.textContent = '';
        usernameInput.style.borderColor = 'rgba(0, 255, 255, 0.3)';
        usernameInput.style.boxShadow = 'none';
    });

    // ========================================
    // ページを開いた時、入力欄にフォーカス
    // ========================================
    usernameInput.focus(); // カーソルを入力欄に自動で移動

});
