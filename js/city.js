// ========================================
// NET CITY β - チャット機能
// ========================================

// Firebase SDKから必要な機能をインポート
import { ref, push, onChildAdded, serverTimestamp, onValue, onDisconnect, set, remove, query, orderByChild, endAt, get, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js';

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
    const imageButton = document.getElementById('imageButton'); // 画像ボタン
    const imageInput = document.getElementById('imageInput'); // 画像入力

    // ========================================
    // ヘッダーに名前を表示
    // ========================================

    usernameDisplay.textContent = username;

    // ========================================
    // Firebase Databaseの参照を取得
    // ========================================

    const database = window.firebaseDatabase; // city.htmlで初期化したデータベース
    const storage = window.firebaseStorage; // city.htmlで初期化したストレージ
    const messagesRef = ref(database, 'messages'); // 'messages'というパスにデータを保存
    const onlineUsersRef = ref(database, 'onlineUsers'); // オンラインユーザーのリスト

    // ========================================
    // メッセージ送信の処理
    // ========================================

    // 送信ボタンをクリックした時
    sendButton.addEventListener('click', sendMessage);

    // Enterキーを押した時
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // 改行を防ぐ
            sendMessage();
        }
    });

    // ========================================
    // テキストエリアの自動リサイズ
    // ========================================

    // 入力内容に応じて高さを調整する関数
    function autoResizeTextarea() {
        messageInput.style.height = 'auto'; // 一旦リセット
        const newHeight = Math.min(messageInput.scrollHeight, 120); // 最大高さを120pxに制限
        messageInput.style.height = newHeight + 'px';
    }

    // 入力時に自動リサイズを実行
    messageInput.addEventListener('input', autoResizeTextarea);

    // ========================================
    // 画像送信の処理
    // ========================================

    // 画像ボタンをクリックした時
    imageButton.addEventListener('click', () => {
        imageInput.click(); // ファイル選択ダイアログを開く
    });

    // 画像が選択された時
    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
            alert('画像サイズは5MB以下にしてください');
            imageInput.value = '';
            return;
        }

        // 画像タイプチェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください');
            imageInput.value = '';
            return;
        }

        try {
            // アップロード中の表示
            sendButton.disabled = true;
            sendButton.textContent = 'アップロード中...';

            // Firebase Storageにアップロード
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
            const imageRef = storageRef(storage, `chat-images/${fileName}`);

            await uploadBytes(imageRef, file);
            const imageUrl = await getDownloadURL(imageRef);

            // メッセージとして保存
            const messageData = {
                username: username,
                imageUrl: imageUrl,
                timestamp: serverTimestamp()
            };

            await push(messagesRef, messageData);

            console.log('画像を送信しました');
            imageInput.value = ''; // 入力をクリア

        } catch (error) {
            console.error('画像アップロードエラー:', error);
            alert('画像の送信に失敗しました');
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = '送信';
        }
    });

    // ========================================
    // メッセージを送信する関数
    // ========================================
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
                messageInput.style.height = 'auto'; // 高さをリセット
            })
            .catch((error) => {
                // 送信失敗
                console.error('送信エラー:', error);
                alert('メッセージの送信に失敗しました。Firebaseの設定を確認してください。');
            });
    }

    // ========================================
    // 古いメッセージの削除処理
    // ========================================

    // 24時間(1日)前のタイムスタンプを計算
    function getOneDayAgoTimestamp() {
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24時間のミリ秒
        return Date.now() - oneDayInMs;
    }

    // 古いメッセージを削除する関数
    async function deleteOldMessages() {
        try {
            const oneDayAgo = getOneDayAgoTimestamp();

            // 24時間より古いメッセージを検索
            const oldMessagesQuery = query(
                messagesRef,
                orderByChild('timestamp'),
                endAt(oneDayAgo)
            );

            // 古いメッセージを取得
            const snapshot = await get(oldMessagesQuery);

            if (snapshot.exists()) {
                const oldMessages = snapshot.val();
                let deletedCount = 0;

                // 各メッセージを削除
                for (const messageId in oldMessages) {
                    await remove(ref(database, `messages/${messageId}`));
                    deletedCount++;
                }

                console.log(`${deletedCount}件の古いメッセージを削除しました`);
            }
        } catch (error) {
            console.error('古いメッセージの削除エラー:', error);
        }
    }

    // ページ読み込み時に一度実行
    deleteOldMessages();

    // 1時間ごとに古いメッセージをチェックして削除
    setInterval(deleteOldMessages, 60 * 60 * 1000); // 1時間 = 60分 × 60秒 × 1000ミリ秒

    // ========================================
    // メッセージの受信とリアルタイム表示
    // ========================================

    // 最初に表示されているウェルカムメッセージを消す
    let isFirstMessage = true;

    // Firebaseから新しいメッセージが追加されるたびに実行される
    onChildAdded(messagesRef, (snapshot) => {
        // スナップショットからデータを取得
        const message = snapshot.val();
        const messageId = snapshot.key; // メッセージのユニークID

        // 最初のメッセージが来たらウェルカムメッセージを消す
        if (isFirstMessage) {
            messagesArea.innerHTML = ''; // 中身を全部消す
            isFirstMessage = false;
        }

        // メッセージを画面に表示
        displayMessage(message, messageId);

        // このメッセージのリアクションをリアルタイムで監視
        const messageReactionsRef = ref(database, `messages/${messageId}/reactions`);
        onValue(messageReactionsRef, (reactionsSnapshot) => {
            updateReactionsDisplay(messageId, reactionsSnapshot.val());
        });
    });

    // ========================================
    // メッセージを画面に表示する関数
    // ========================================

    function displayMessage(message, messageId) {
        // メッセージのコンテナ要素を作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.dataset.messageId = messageId; // メッセージIDを保存

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

        // メッセージの内容を決定（テキストまたは画像）
        let contentHTML = '';
        if (message.imageUrl) {
            // 画像メッセージの場合
            contentHTML = `
                <div class="message-content">
                    <img src="${escapeHtml(message.imageUrl)}" class="message-image" alt="送信された画像" loading="lazy">
                </div>
            `;
        } else if (message.text) {
            // テキストメッセージの場合
            const escapedText = escapeHtml(message.text);
            const linkedText = linkifyText(escapedText);
            contentHTML = `
                <div class="message-content">
                    ${linkedText}
                </div>
            `;
        }

        // メッセージのHTML構造を作成
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${escapeHtml(message.username)}</span>
                <span class="message-time">${timeString}</span>
            </div>
            ${contentHTML}
            <div class="message-reactions" data-message-id="${messageId}">
                <button class="add-reaction-btn" data-message-id="${messageId}">+</button>
            </div>
        `;

        // メッセージエリアに追加
        messagesArea.appendChild(messageDiv);

        // リアクション追加ボタンのイベントを設定
        const addReactionBtn = messageDiv.querySelector('.add-reaction-btn');
        addReactionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showReactionPicker(messageId, addReactionBtn);
        });

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
    // URLを自動リンク化する関数
    // ========================================

    function linkifyText(text) {
        // URL検出用の正規表現（http/https URL）
        const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

        // URLをリンクタグに置き換え
        return text.replace(urlPattern, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
        });
    }

    // ========================================
    // リアクション機能
    // ========================================

    // 利用可能なリアクション絵文字のリスト
    const availableReactions = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '😮', '😢', '😂', '🤔'];

    // リアクションピッカーを表示する
    let currentPicker = null;

    function showReactionPicker(messageId, button) {
        // 既存のピッカーを閉じる
        if (currentPicker) {
            currentPicker.remove();
            currentPicker = null;
            return;
        }

        // リアクションピッカーを作成
        const picker = document.createElement('div');
        picker.className = 'reaction-picker active';

        const grid = document.createElement('div');
        grid.className = 'reaction-picker-grid';

        // 各絵文字ボタンを作成
        availableReactions.forEach(emoji => {
            const emojiBtn = document.createElement('div');
            emojiBtn.className = 'reaction-picker-emoji';
            emojiBtn.textContent = emoji;
            emojiBtn.addEventListener('click', () => {
                addReaction(messageId, emoji);
                picker.remove();
                currentPicker = null;
            });
            grid.appendChild(emojiBtn);
        });

        picker.appendChild(grid);

        // ピッカーを配置
        button.parentElement.appendChild(picker);
        currentPicker = picker;

        // ピッカー外をクリックしたら閉じる
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (currentPicker && !currentPicker.contains(e.target) && e.target !== button) {
                    currentPicker.remove();
                    currentPicker = null;
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

    // リアクションを追加または削除する
    async function addReaction(messageId, emoji) {
        try {
            const reactionRef = ref(database, `messages/${messageId}/reactions/${emoji}/${userId}`);
            const snapshot = await get(reactionRef);

            if (snapshot.exists()) {
                // 既にリアクションしている場合は削除
                await remove(reactionRef);
            } else {
                // リアクションを追加
                await set(reactionRef, true);
            }
        } catch (error) {
            console.error('リアクションエラー:', error);
        }
    }

    // リアクション表示を更新する
    function updateReactionsDisplay(messageId, reactions) {
        const reactionsContainer = messagesArea.querySelector(`.message-reactions[data-message-id="${messageId}"]`);
        if (!reactionsContainer) return;

        // 既存のリアクションアイテムを削除（+ボタンは残す）
        const existingReactions = reactionsContainer.querySelectorAll('.reaction-item');
        existingReactions.forEach(item => item.remove());

        // リアクションがない場合は終了
        if (!reactions) return;

        // 各リアクションを表示
        const addBtn = reactionsContainer.querySelector('.add-reaction-btn');

        Object.keys(reactions).forEach(emoji => {
            const users = reactions[emoji];
            const count = Object.keys(users).length;

            if (count === 0) return;

            // リアクションアイテムを作成
            const reactionItem = document.createElement('div');
            reactionItem.className = 'reaction-item';

            // 自分がリアクションしているかチェック
            if (users[userId]) {
                reactionItem.classList.add('reacted');
            }

            reactionItem.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${count}</span>
            `;

            // クリックでリアクションを追加/削除
            reactionItem.addEventListener('click', () => {
                addReaction(messageId, emoji);
            });

            // +ボタンの前に挿入
            reactionsContainer.insertBefore(reactionItem, addBtn);
        });
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
