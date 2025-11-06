// ========================================
// 入場画面の処理
// ========================================

// ページが読み込まれたら実行される
document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // 番号システム: 1-999のランダム番号を割り当て
    // ========================================

    // 既に番号が保存されている場合は自動的にチャット画面へ
    const savedUserNumber = localStorage.getItem('netcity_userNumber');
    if (savedUserNumber) {
        console.log(`既存のユーザー番号「${savedUserNumber}」として自動入場します`);
        window.location.href = 'city.html';
        return; // ここで処理を終了
    }

    // HTML要素を取得
    const numberDisplay = document.getElementById('userNumber'); // 番号表示
    const enterButton = document.getElementById('enterButton'); // 入場ボタン

    // ========================================
    // 1-999のランダムな番号を生成
    // ========================================
    function generateRandomNumber() {
        return Math.floor(Math.random() * 999) + 1; // 1から999のランダムな整数
    }

    // 初回起動時に番号を割り当て
    const userNumber = generateRandomNumber();
    console.log(`新しい番号を割り当てました: ${userNumber}`);

    // 番号を画面に表示
    if (numberDisplay) {
        numberDisplay.textContent = userNumber;
    }

    // ========================================
    // 入場ボタンをクリックした時の処理
    // ========================================
    enterButton.addEventListener('click', function() {
        handleEnter();
    });

    // ========================================
    // 入場処理の関数
    // ========================================
    function handleEnter() {
        // localStorageに番号を保存（ブラウザに記憶）
        localStorage.setItem('netcity_userNumber', userNumber);

        // 番号変更日を初期化（今日の日付を保存）
        const today = new Date().toDateString();
        localStorage.setItem('netcity_numberChangeDate', today);

        console.log(`番号 ${userNumber} で入場します`);

        // city.htmlへ移動
        window.location.href = 'city.html';
    }

    // ========================================
    // エンターキーでも入場できるようにする
    // ========================================
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleEnter();
        }
    });

});
