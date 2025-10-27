// ========================================
// NET CITY β - チャット機能
// ========================================

// Firebase SDKから必要な機能をインポート
import { ref, push, onChildAdded, serverTimestamp, onValue, onDisconnect, set, remove } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// ========================================
// 初期化処理
// ========================================

// ページが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // ユーザー名の取得とチェック
    // ========================================

    // localStorageから名前を取得
    const username = localStorage.getItem('netcity_username');

    // 名前が保存されていない場合は、入場画面に戻す
    if (!username) {
        alert('先に名前を入力してください');
        window.location.href = 'index.html';
        return; // ここで処理を終了
    }

    // ========================================
    // HTML要素を取得
    // ========================================

    const usernameDisplay = document.getElementById('usernameDisplay'); // ヘッダーの名前表示
    const logoutButton = document.getElementById('logoutButton'); // 退出ボタン
    const messagesArea = document.getElementById('messagesArea'); // メッセージ表示エリア
    const messageInput = document.getElementById('messageInput'); // 入力欄
    const sendButton = document.getElementById('sendButton'); // 送信ボタン
    const onlineCount = document.getElementById('onlineCount'); // オンライン人数表示

    // ========================================
    // ヘッダーに名前を表示
    // ========================================

    usernameDisplay.textContent = username;

    // ========================================
    // Firebase Databaseの参照を取得
    // ========================================

    const database = window.firebaseDatabase; // city.htmlで初期化したデータベース
    const messagesRef = ref(database, 'messages'); // 'messages'というパスにデータを保存
    const onlineUsersRef = ref(database, 'onlineUsers'); // オンラインユーザーのリスト

    // ========================================
    // メッセージ送信の処理
    // ========================================

    // 送信ボタンをクリックした時
    sendButton.addEventListener('click', sendMessage);

    // Enterキーを押した時
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // メッセージを送信する関数
    function sendMessage() {
        // 入力されたメッセージを取得（前後の空白を削除）
        const messageText = messageInput.value.trim();

        // 空のメッセージは送信しない
        if (messageText === '') {
            return;
        }

        // Firebaseに送信するデータ
        const messageData = {
            username: username,          // 送信者の名前
            text: messageText,            // メッセージ本文
            timestamp: serverTimestamp() // サーバーの時刻（自動で設定）
        };

        // Firebaseにデータを送信（push = 新しいデータを追加）
        push(messagesRef, messageData)
            .then(() => {
                // 送信成功
                console.log('メッセージを送信しました');
                messageInput.value = ''; // 入力欄をクリア
            })
            .catch((error) => {
                // 送信失敗
                console.error('送信エラー:', error);
                alert('メッセージの送信に失敗しました。Firebaseの設定を確認してください。');
            });
    }

    // ========================================
    // メッセージの受信とリアルタイム表示
    // ========================================

    // 最初に表示されているウェルカムメッセージを消す
    let isFirstMessage = true;

    // Firebaseから新しいメッセージが追加されるたびに実行される
    onChildAdded(messagesRef, (snapshot) => {
        // スナップショットからデータを取得
        const message = snapshot.val();

        // 最初のメッセージが来たらウェルカムメッセージを消す
        if (isFirstMessage) {
            messagesArea.innerHTML = ''; // 中身を全部消す
            isFirstMessage = false;
        }

        // メッセージを画面に表示
        displayMessage(message);
    });

    // ========================================
    // メッセージを画面に表示する関数
    // ========================================

    function displayMessage(message) {
        // メッセージのコンテナ要素を作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        // 自分のメッセージかどうかをチェック
        if (message.username === username) {
            messageDiv.classList.add('own'); // 自分のメッセージには'own'クラスを追加
        }

        // 時刻をフォーマット（例: 14:30）
        let timeString = '';
        if (message.timestamp) {
            const date = new Date(message.timestamp);
            const hours = date.getHours().toString().padStart(2, '0'); // 2桁にする（例: 09）
            const minutes = date.getMinutes().toString().padStart(2, '0');
            timeString = `${hours}:${minutes}`;
        } else {
            timeString = '送信中...';
        }

        // メッセージのHTML構造を作成
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${escapeHtml(message.username)}</span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-content">
                ${escapeHtml(message.text)}
            </div>
        `;

        // メッセージエリアに追加
        messagesArea.appendChild(messageDiv);

        // 自動的に一番下までスクロール（新しいメッセージが見えるように）
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // ========================================
    // HTML特殊文字をエスケープ（セキュリティ対策）
    // ========================================

    // <script>タグなどが埋め込まれるのを防ぐ
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // オンライン人数の管理
    // ========================================

    // ユニークなユーザーIDを生成（タイムスタンプ + ランダム値）
    const userId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userOnlineRef = ref(database, `onlineUsers/${userId}`);

    // 自分がオンラインであることを登録
    set(userOnlineRef, {
        username: username,
        joinedAt: serverTimestamp()
    });

    // ページを閉じたら自動的に削除（重要！）
    onDisconnect(userOnlineRef).remove();

    // オンライン人数をリアルタイムで監視
    onValue(onlineUsersRef, (snapshot) => {
        const onlineUsers = snapshot.val();

        if (onlineUsers) {
            // オンラインユーザーの数を数える
            const count = Object.keys(onlineUsers).length;

            // 表示を更新
            if (count === 1) {
                onlineCount.textContent = 'あなただけ';
            } else {
                onlineCount.textContent = `${count}人オンライン`;
            }
        } else {
            // 誰もいない場合
            onlineCount.textContent = '0人オンライン';
        }
    });

    // ========================================
    // 退出ボタンの処理（オンライン情報削除も含む）
    // ========================================

    logoutButton.addEventListener('click', function() {
        // 確認ダイアログを表示
        if (confirm('NET CITY βから退出しますか？')) {
            // オンライン情報を削除
            remove(userOnlineRef).then(() => {
                // localStorageから名前を削除
                localStorage.removeItem('netcity_username');
                // 入場画面に戻る
                window.location.href = 'index.html';
            });
        }
    });

    // ========================================
    // 入力欄にフォーカス
    // ========================================

    messageInput.focus(); // カーソルを入力欄に自動で移動

});
