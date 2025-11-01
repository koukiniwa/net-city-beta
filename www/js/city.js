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
    const messagesArea = document.getElementById('messagesArea'); // メッセージ表示エリア
    const messageInput = document.getElementById('messageInput'); // 入力欄
    const sendButton = document.getElementById('sendButton'); // 送信ボタン
    const onlineCount = document.getElementById('onlineCount'); // オンライン人数表示
    const imageButton = document.getElementById('imageButton'); // 画像ボタン
    const imageInput = document.getElementById('imageInput'); // 画像入力
    const chatHeader = document.querySelector('.chat-header'); // チャットヘッダー
    const inputArea = document.querySelector('.input-area'); // 入力エリア

    // ハンバーガーメニュー関連の要素
    const hamburgerMenu = document.getElementById('hamburgerMenu'); // ハンバーガーボタン
    const sidebarMenu = document.getElementById('sidebarMenu'); // サイドバーメニュー
    const sidebarOverlay = document.getElementById('sidebarOverlay'); // オーバーレイ
    const closeMenu = document.getElementById('closeMenu'); // 閉じるボタン
    const editNameMenu = document.getElementById('editNameMenu'); // 名前変更メニュー
    const lightModeBtn = document.getElementById('lightMode'); // ライトモードボタン
    const neonModeBtn = document.getElementById('neonMode'); // ネオンモードボタン

    // ルーム関連の要素
    const roomTabs = document.getElementById('roomTabs'); // ルームタブコンテナ
    const createRoomBtn = document.getElementById('createRoomBtn'); // ルーム作成ボタン
    const currentRoomName = document.getElementById('currentRoomName'); // 現在のルーム名表示
    const createRoomModal = document.getElementById('createRoomModal'); // ルーム作成モーダル
    const roomNameInput = document.getElementById('roomName'); // ルーム名入力
    const roomDescriptionInput = document.getElementById('roomDescription'); // ルーム説明入力
    const emojiSelector = document.getElementById('emojiSelector'); // 絵文字選択エリア
    const cancelCreateRoom = document.getElementById('cancelCreateRoom'); // キャンセルボタン
    const confirmCreateRoom = document.getElementById('confirmCreateRoom'); // 作成ボタン

    // ========================================
    // ヘッダーに名前を表示
    // ========================================

    usernameDisplay.textContent = username;

    // ========================================
    // Firebase Databaseの参照を取得
    // ========================================

    const database = window.firebaseDatabase; // city.htmlで初期化したデータベース
    const storage = window.firebaseStorage; // city.htmlで初期化したストレージ

    // ルーム機能用の参照
    const roomsRef = ref(database, 'rooms'); // 全ルーム情報
    const roomUsersRef = ref(database, 'roomUsers'); // 全ルームのユーザー情報

    // 現在のルーム状態
    let currentRoomId = null; // 現在いるルームID（初期値はnull）
    let messagesRef = null; // 現在のルームのメッセージ
    let currentRoomUsersRef = null; // 現在のルームのユーザー
    let currentMessagesListener = null; // メッセージリスナーの参照を保持
    let currentUserCountListener = null; // ユーザー数リスナーの参照を保持

    // ルームデータのキャッシュ
    let roomsCache = {};
    let selectedEmoji = '💬'; // 選択された絵文字（デフォルト）
    let roomUserListeners = {}; // 各ルームタブのユーザー数リスナーを管理

    // ユニークなユーザーIDを生成（タイムスタンプ + ランダム値）
    // localStorageから取得、なければ新規生成して保存
    let userId = localStorage.getItem('netcity_userId');
    if (!userId) {
        userId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('netcity_userId', userId);
        console.log('新しいユーザーIDを生成しました:', userId);
    } else {
        console.log('既存のユーザーIDを使用します:', userId);
    }

    // ========================================
    // ルーム機能
    // ========================================

    // ルームの初期化
    async function initializeRooms() {
        try {
            console.log('ルーム初期化開始...');

            // 固定ルーム（広場）を作成または確認
            const plazaRef = ref(database, 'rooms/plaza');
            const plazaSnapshot = await get(plazaRef);

            if (!plazaSnapshot.exists()) {
                // 広場が存在しない場合は作成
                console.log('広場を新規作成します');
                await set(plazaRef, {
                    id: 'plaza',
                    name: '広場',
                    emoji: '🏠',
                    maxUsers: 0, // 0 = 無制限
                    isPermanent: true,
                    createdAt: Date.now(),
                    createdBy: 'system'
                });
            }

            // 最初に一度ルーム一覧を取得
            const roomsSnapshot = await get(roomsRef);
            const rooms = roomsSnapshot.val();

            if (rooms) {
                console.log('ルーム一覧を取得しました:', Object.keys(rooms));
                roomsCache = rooms;
                updateRoomTabs(rooms);
            } else {
                console.error('ルーム一覧の取得に失敗しました');
            }

            // ルーム一覧をリアルタイムで監視（2回目以降の更新用）
            onValue(roomsRef, (snapshot) => {
                const updatedRooms = snapshot.val();
                if (updatedRooms) {
                    roomsCache = updatedRooms;
                    updateRoomTabs(updatedRooms);
                }
            });

            // 初期ルーム（広場）に入室
            console.log('広場に入室します...');
            await joinRoom('plaza');
            console.log('ルーム初期化完了');

        } catch (error) {
            console.error('ルーム初期化エラー:', error);
            alert('ルームの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }

    // ルームタブの表示を更新
    function updateRoomTabs(rooms) {
        // 古いリスナーを全て削除
        Object.keys(roomUserListeners).forEach(roomId => {
            if (roomUserListeners[roomId]) {
                roomUserListeners[roomId](); // off関数を実行
            }
        });
        roomUserListeners = {}; // リセット

        roomTabs.innerHTML = ''; // 既存のタブをクリア

        // ルームを配列に変換して並び替え
        const roomArray = Object.values(rooms);

        // 固定ルーム（広場）を最初に、その後は作成日時順
        roomArray.sort((a, b) => {
            if (a.isPermanent) return -1;
            if (b.isPermanent) return 1;
            return b.createdAt - a.createdAt;
        });

        // 各ルームのタブを作成
        roomArray.forEach(room => {
            const tab = createRoomTab(room);
            roomTabs.appendChild(tab);
        });
    }

    // ルームタブを作成
    function createRoomTab(room) {
        const tab = document.createElement('div');
        tab.className = 'room-tab';
        tab.dataset.roomId = room.id;

        // 現在のルームの場合はactiveクラスを追加
        if (room.id === currentRoomId) {
            tab.classList.add('active');
        }

        // 人数を取得（リアルタイムで更新）
        const userCountSpan = document.createElement('span');
        userCountSpan.className = 'room-count';

        // ルームのユーザー数を監視（リスナーを保存）
        const roomUserRef = ref(database, `roomUsers/${room.id}`);
        const unsubscribe = onValue(roomUserRef, (snapshot) => {
            const users = snapshot.val();
            const count = users ? Object.keys(users).length : 0;

            if (room.maxUsers === 0) {
                // 無制限の場合
                userCountSpan.textContent = '∞';
                userCountSpan.classList.remove('full');
            } else {
                // 人数制限がある場合
                userCountSpan.textContent = `${count}/${room.maxUsers}`;

                if (count >= room.maxUsers) {
                    userCountSpan.classList.add('full');
                    tab.classList.add('full');
                } else {
                    userCountSpan.classList.remove('full');
                    tab.classList.remove('full');
                }
            }
        });

        // リスナーを管理用オブジェクトに保存
        roomUserListeners[room.id] = unsubscribe;

        // タブの内容を構築
        tab.innerHTML = `
            <span class="room-emoji">${room.emoji}</span>
            <span class="room-name">${room.name}</span>
        `;
        tab.appendChild(userCountSpan);

        // クリックイベント
        tab.addEventListener('click', () => {
            if (!tab.classList.contains('full') || room.id === currentRoomId) {
                joinRoom(room.id);
            }
        });

        return tab;
    }

    // ルームに入室
    async function joinRoom(roomId) {
        try {
            console.log(`ルーム入室処理開始: ${roomId}`);

            if (currentRoomId === roomId) {
                console.log('既に同じルームにいます');
                return; // 既に同じルームにいる場合は何もしない
            }

            // フェードアウトアニメーション開始
            messagesArea.classList.add('fade-out');
            messagesArea.classList.remove('fade-in');
            chatHeader.classList.add('fade-out');
            chatHeader.classList.remove('fade-in');
            inputArea.classList.add('fade-out');
            inputArea.classList.remove('fade-in');

            // アニメーションの完了を待つ（300ms）
            await new Promise(resolve => setTimeout(resolve, 300));

            // 前のルームから退出
            if (currentRoomId) {
                console.log(`前のルーム ${currentRoomId} から退出`);
                await leaveRoom(currentRoomId);
            }

            // 古いリスナーを削除（メモリリーク対策）
            if (currentMessagesListener) {
                currentMessagesListener(); // off関数を実行
                currentMessagesListener = null;
            }
            if (currentUserCountListener) {
                currentUserCountListener(); // off関数を実行
                currentUserCountListener = null;
            }

            // 新しいルームに入室
            currentRoomId = roomId;
            messagesRef = ref(database, `roomMessages/${roomId}`);
            currentRoomUsersRef = ref(database, `roomUsers/${roomId}`);

            // ルーム名を更新
            const room = roomsCache[roomId];
            if (room) {
                currentRoomName.textContent = `${room.emoji} ${room.name}`;
                console.log(`ルーム名を更新: ${room.name}`);
            } else {
                console.warn(`ルーム情報が見つかりません: ${roomId}`);
                currentRoomName.textContent = 'チャットルーム';
            }

            // メッセージエリアをクリア
            messagesArea.innerHTML = '<div class="welcome-message"><p>ルームに入室しました</p></div>';

            // ユーザー情報を登録
            const userRef = ref(database, `roomUsers/${roomId}/${userId}`);
            await set(userRef, {
                username: username,
                joinedAt: Date.now(),
                lastActive: Date.now()
            });
            console.log('ユーザー情報を登録しました');

            // ページ閉じたら自動削除
            onDisconnect(userRef).remove();

            // 現在のルームのユーザー数を監視
            monitorCurrentRoomUsers();

            // メッセージを読み込み
            loadRoomMessages(roomId);

            // ルームタブのactiveを更新
            document.querySelectorAll('.room-tab').forEach(tab => {
                if (tab.dataset.roomId === roomId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            // フェードインアニメーション開始
            messagesArea.classList.remove('fade-out');
            messagesArea.classList.add('fade-in');
            chatHeader.classList.remove('fade-out');
            chatHeader.classList.add('fade-in');
            inputArea.classList.remove('fade-out');
            inputArea.classList.add('fade-in');

            console.log(`ルーム「${room ? room.name : roomId}」に入室しました`);

        } catch (error) {
            console.error('ルーム入室エラー:', error);
            alert('ルームへの入室に失敗しました');
            // エラー時もフェードインして画面を戻す
            messagesArea.classList.remove('fade-out');
            messagesArea.classList.add('fade-in');
            chatHeader.classList.remove('fade-out');
            chatHeader.classList.add('fade-in');
            inputArea.classList.remove('fade-out');
            inputArea.classList.add('fade-in');
        }
    }

    // ルームから退出
    async function leaveRoom(roomId) {
        const userRef = ref(database, `roomUsers/${roomId}/${userId}`);
        await remove(userRef);
    }

    // ルームのメッセージを読み込み
    function loadRoomMessages(roomId) {
        const roomMessagesRef = ref(database, `roomMessages/${roomId}`);

        // 一度だけ実行してウェルカムメッセージを消す
        let isFirstMessage = true;

        // onChildAddedはoff関数を返すので保存
        currentMessagesListener = onChildAdded(roomMessagesRef, (snapshot) => {
            const message = snapshot.val();
            const messageId = snapshot.key;

            if (isFirstMessage) {
                messagesArea.innerHTML = '';
                isFirstMessage = false;
            }

            displayMessage(message, messageId);

            // リアクションを監視
            const messageReactionsRef = ref(database, `roomMessages/${roomId}/${messageId}/reactions`);
            onValue(messageReactionsRef, (reactionsSnapshot) => {
                updateReactionsDisplay(messageId, reactionsSnapshot.val());
            });
        });
    }

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

        // ルームに入室していない場合は送信しない
        if (!messagesRef) {
            console.error('ルームに入室していません');
            alert('ルームに入室してからメッセージを送信してください。');
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

    // 古いメッセージを削除する関数（全ルーム対象）
    async function deleteOldMessages() {
        try {
            const oneDayAgo = getOneDayAgoTimestamp();
            console.log(`24時間前のタイムスタンプ: ${oneDayAgo} (${new Date(oneDayAgo).toLocaleString()})`);

            // 全ルームを取得
            const roomsSnapshot = await get(roomsRef);
            if (!roomsSnapshot.exists()) {
                console.log('ルームが存在しません');
                return;
            }

            const rooms = roomsSnapshot.val();
            let totalDeleted = 0;

            // 各ルームの古いメッセージを削除
            for (const roomId in rooms) {
                const roomMessagesRef = ref(database, `roomMessages/${roomId}`);

                // まず全メッセージを取得してクライアント側でフィルタリング
                const allMessagesSnapshot = await get(roomMessagesRef);

                if (allMessagesSnapshot.exists()) {
                    const allMessages = allMessagesSnapshot.val();

                    for (const messageId in allMessages) {
                        const message = allMessages[messageId];

                        // タイムスタンプが存在し、24時間以上前の場合は削除
                        if (message.timestamp && message.timestamp < oneDayAgo) {
                            try {
                                await remove(ref(database, `roomMessages/${roomId}/${messageId}`));
                                totalDeleted++;
                                console.log(`削除: ${roomId}/${messageId} (${new Date(message.timestamp).toLocaleString()})`);
                            } catch (removeError) {
                                console.error(`削除失敗: ${roomId}/${messageId}`, removeError);
                            }
                        }
                    }
                }
            }

            if (totalDeleted > 0) {
                console.log(`✅ ${totalDeleted}件の古いメッセージを削除しました`);
            } else {
                console.log('削除対象の古いメッセージはありませんでした');
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
    // ※ルーム機能により、loadRoomMessages()で処理されるため、ここでのメッセージ監視は削除

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

        // ボタンの位置を取得してピッカーを配置
        const buttonRect = button.getBoundingClientRect();
        picker.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
        picker.style.top = `${buttonRect.top}px`;

        // bodyに追加
        document.body.appendChild(picker);
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
            const reactionRef = ref(database, `roomMessages/${currentRoomId}/${messageId}/reactions/${emoji}/${userId}`);
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
    // ルーム内のオンライン人数の管理
    // ========================================
    // ※現在のルームの人数はcurrentRoomUsersRefで監視される

    // 現在のルームのユーザー数をリアルタイムで監視
    function monitorCurrentRoomUsers() {
        if (!currentRoomUsersRef) {
            console.error('currentRoomUsersRefが未設定です');
            return;
        }

        console.log('ユーザー数の監視を開始します');
        currentUserCountListener = onValue(currentRoomUsersRef, (snapshot) => {
            const roomUsers = snapshot.val();

            if (roomUsers) {
                const count = Object.keys(roomUsers).length;
                console.log(`現在の人数: ${count}人`);

                if (count === 1) {
                    onlineCount.textContent = 'あなただけ';
                } else {
                    onlineCount.textContent = `${count}人`;
                }
            } else {
                console.log('ルームにユーザーがいません');
                onlineCount.textContent = '0人';
            }
        });
    }

    // ========================================
    // ルーム作成モーダルの処理
    // ========================================

    // 絵文字選択の処理
    emojiSelector.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji-option')) {
            // 既存の選択を解除
            document.querySelectorAll('.emoji-option').forEach(btn => {
                btn.classList.remove('selected');
            });
            // 新しい選択を設定
            e.target.classList.add('selected');
            selectedEmoji = e.target.dataset.emoji;
        }
    });

    // ルーム作成ボタンをクリック
    createRoomBtn.addEventListener('click', () => {
        // デフォルト絵文字を選択状態にする
        document.querySelectorAll('.emoji-option').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.emoji === '💬') {
                btn.classList.add('selected');
            }
        });
        selectedEmoji = '💬';
        // モーダルを表示
        createRoomModal.style.display = 'flex';
        roomNameInput.value = '';
        roomDescriptionInput.value = '';
        roomNameInput.focus();
    });

    // キャンセルボタン
    cancelCreateRoom.addEventListener('click', () => {
        createRoomModal.style.display = 'none';
    });

    // モーダルの外側をクリックしたら閉じる
    createRoomModal.addEventListener('click', (e) => {
        if (e.target === createRoomModal) {
            createRoomModal.style.display = 'none';
        }
    });

    // ルーム作成確定ボタン
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();

        // バリデーション
        if (!roomName || roomName.length < 2) {
            alert('ルーム名は2文字以上で入力してください');
            return;
        }

        if (roomName.length > 15) {
            alert('ルーム名は15文字以内で入力してください');
            return;
        }

        // 選択されたmaxUsersを取得
        const maxUsersRadio = document.querySelector('input[name="maxUsers"]:checked');
        const maxUsers = parseInt(maxUsersRadio.value);

        try {
            // 既存のルーム数をチェック（広場を除く）
            const roomsSnapshot = await get(roomsRef);
            const rooms = roomsSnapshot.val() || {};
            const customRooms = Object.values(rooms).filter(room => !room.isPermanent);

            if (customRooms.length >= 8) {
                alert('カスタムルームは最大8個までです');
                return;
            }

            // ユーザーが既にルームを作成していないかチェック
            const userCreatedRoom = customRooms.find(room => room.createdBy === userId);
            if (userCreatedRoom) {
                alert('既にルームを作成しています。作成できるルームは1つまでです。');
                return;
            }

            // ルームIDを生成
            const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // ルームデータを作成
            const roomData = {
                id: roomId,
                name: roomName,
                emoji: selectedEmoji,
                maxUsers: maxUsers,
                description: roomDescriptionInput.value.trim() || '',
                isPermanent: false,
                createdAt: Date.now(),
                createdBy: userId,
                creatorName: username
            };

            // Firebaseに保存
            await set(ref(database, `rooms/${roomId}`), roomData);

            console.log(`ルーム「${roomName}」を作成しました`);

            // モーダルを閉じる
            createRoomModal.style.display = 'none';

            // 作成したルームに自動的に入室
            await joinRoom(roomId);

        } catch (error) {
            console.error('ルーム作成エラー:', error);
            alert('ルームの作成に失敗しました');
        }
    });

    // ========================================
    // 自動削除ロジック
    // ========================================

    // ルームの自動削除チェック（定期実行）
    async function checkAndDeleteEmptyRooms() {
        try {
            const roomsSnapshot = await get(roomsRef);
            if (!roomsSnapshot.exists()) return;

            const rooms = roomsSnapshot.val();
            const now = Date.now();
            const oneHourInMs = 60 * 60 * 1000; // 1時間
            const oneDayInMs = 24 * 60 * 60 * 1000; // 24時間

            for (const roomId in rooms) {
                const room = rooms[roomId];

                // 固定ルーム（広場）はスキップ
                if (room.isPermanent) continue;

                // ルームのユーザー数を取得
                const roomUserRef = ref(database, `roomUsers/${roomId}`);
                const usersSnapshot = await get(roomUserRef);
                const users = usersSnapshot.val();
                const userCount = users ? Object.keys(users).length : 0;

                // 削除条件1: 1時間以上誰もいない
                const isEmptyForOneHour = userCount === 0 && (now - room.createdAt) > oneHourInMs;

                // 削除条件2: 作成から24時間経過
                const isOlderThanOneDay = (now - room.createdAt) > oneDayInMs;

                if (isEmptyForOneHour || isOlderThanOneDay) {
                    // ルームを削除
                    await remove(ref(database, `rooms/${roomId}`));
                    await remove(ref(database, `roomUsers/${roomId}`));
                    await remove(ref(database, `roomMessages/${roomId}`));

                    console.log(`ルーム「${room.name}」を自動削除しました（理由: ${isOlderThanOneDay ? '24時間経過' : '1時間以上空室'}）`);
                }
            }
        } catch (error) {
            console.error('ルーム自動削除エラー:', error);
        }
    }

    // 10分ごとに自動削除チェック
    setInterval(checkAndDeleteEmptyRooms, 10 * 60 * 1000);

    // ========================================
    // スワイプでルーム切り替え（スマホ対応）
    // ========================================

    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    // タッチ開始
    messagesArea.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    // タッチ終了
    messagesArea.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    // スワイプ処理
    function handleSwipe() {
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;

        // 縦スクロールの方が大きい場合はスワイプとみなさない
        if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) {
            return;
        }

        // 50px以上のスワイプで反応
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistanceX) > minSwipeDistance) {
            // 現在のルーム一覧を取得
            const roomTabs = Array.from(document.querySelectorAll('.room-tab'));
            const currentIndex = roomTabs.findIndex(tab => tab.dataset.roomId === currentRoomId);

            if (currentIndex === -1) return;

            let targetIndex = currentIndex;

            // 左スワイプ = 次のルーム
            if (swipeDistanceX < 0 && currentIndex < roomTabs.length - 1) {
                targetIndex = currentIndex + 1;
            }
            // 右スワイプ = 前のルーム
            else if (swipeDistanceX > 0 && currentIndex > 0) {
                targetIndex = currentIndex - 1;
            }

            // ルーム切り替え
            if (targetIndex !== currentIndex) {
                const targetRoomId = roomTabs[targetIndex].dataset.roomId;
                joinRoom(targetRoomId);
                console.log(`スワイプでルーム切り替え: ${targetRoomId}`);
            }
        }
    }

    // ========================================
    // ハンバーガーメニュー
    // ========================================

    // メニューを開く
    function openSidebar() {
        sidebarMenu.classList.add('active');
        sidebarOverlay.classList.add('active');
    }

    // メニューを閉じる
    function closeSidebar() {
        sidebarMenu.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    // ハンバーガーボタンクリック
    hamburgerMenu.addEventListener('click', openSidebar);

    // 閉じるボタンクリック
    closeMenu.addEventListener('click', closeSidebar);

    // オーバーレイクリック
    sidebarOverlay.addEventListener('click', closeSidebar);

    // 名前変更メニュークリック
    editNameMenu.addEventListener('click', function() {
        closeSidebar();
        // 既存の名前変更処理を呼び出す
        const newName = prompt('新しい名前を入力してください:', username);
        if (newName && newName.trim()) {
            const trimmedName = newName.trim();
            if (trimmedName.length > 20) {
                alert('名前は20文字以内にしてください');
                return;
            }
            // localStorageに保存
            localStorage.setItem('netcity_username', trimmedName);
            // 画面に反映
            usernameDisplay.textContent = trimmedName;
            // 表示を更新
            alert(`名前を「${trimmedName}」に変更しました！`);
        }
    });

    // ========================================
    // テーマ切り替え
    // ========================================

    // localStorageからテーマを取得（デフォルトはライトモード）
    const savedTheme = localStorage.getItem('netcity_theme') || 'light';

    // 初期テーマを適用
    function applyTheme(theme) {
        if (theme === 'neon') {
            document.body.classList.add('neon-mode');
            lightModeBtn.classList.remove('active');
            neonModeBtn.classList.add('active');
        } else {
            document.body.classList.remove('neon-mode');
            lightModeBtn.classList.add('active');
            neonModeBtn.classList.remove('active');
        }
        localStorage.setItem('netcity_theme', theme);
    }

    // ページ読み込み時にテーマを適用
    applyTheme(savedTheme);

    // ライトモードボタンクリック
    lightModeBtn.addEventListener('click', function() {
        applyTheme('light');
    });

    // ネオンモードボタンクリック
    neonModeBtn.addEventListener('click', function() {
        applyTheme('neon');
    });

    // ========================================
    // 初期化
    // ========================================

    // ルーム機能を初期化
    initializeRooms();

    // 入力欄にフォーカス
    messageInput.focus(); // カーソルを入力欄に自動で移動

});
