// ========================================
// NET CITY β - チャット機能
// ========================================

// Firebase SDKから必要な機能をインポート
import { ref, push, onChildAdded, onChildChanged, onChildRemoved, serverTimestamp, onValue, onDisconnect, set, remove, query, orderByChild, limitToLast, endAt, get, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// ========================================
// 初期化処理
// ========================================

// ページが読み込まれたら実行
document.addEventListener('DOMContentLoaded', async function() {

    // ========================================
    // ユーザー番号の取得とチェック
    // ========================================

    // localStorageから番号を取得
    const userNumber = localStorage.getItem('netcity_userNumber');

    // 番号が保存されていない場合は、入場画面に戻す
    if (!userNumber) {
        alert('先に番号を取得してください');
        window.location.href = 'index.html';
        return; // ここで処理を終了
    }

    // 表示用の番号（No.XX形式）
    const displayNumber = `No.${userNumber}`;

    // ========================================
    // HTML要素を取得
    // ========================================

    const usernameDisplay = document.getElementById('usernameDisplay'); // ヘッダーの名前表示
    const messagesArea = document.getElementById('messagesArea'); // メッセージ表示エリア
    const messageInput = document.getElementById('messageInput'); // 入力欄
    const sendButton = document.getElementById('sendButton'); // 送信ボタン
    const inputArea = document.querySelector('.input-area'); // 入力エリア

    // ハンバーガーメニュー関連の要素
    const hamburgerMenu = document.getElementById('hamburgerMenu'); // ハンバーガーボタン
    const sidebarMenu = document.getElementById('sidebarMenu'); // サイドバーメニュー
    const sidebarOverlay = document.getElementById('sidebarOverlay'); // オーバーレイ
    const closeMenu = document.getElementById('closeMenu'); // 閉じるボタン
    const editNumberMenu = document.getElementById('editNumberMenu'); // 番号変更メニュー
    const lightModeBtn = document.getElementById('lightMode'); // ライトモードボタン
    const neonModeBtn = document.getElementById('neonMode'); // ネオンモードボタン

    // カテゴリ関連の要素
    const categoryTabs = document.getElementById('categoryTabs'); // カテゴリタブコンテナ

    // ビュー関連の要素
    const roomListView = document.getElementById('roomListView'); // ルーム一覧ビュー
    const chatView = document.getElementById('chatView'); // チャットビュー
    const roomCardsContainer = document.getElementById('roomCardsContainer'); // ルームカードコンテナ
    const backToRoomList = document.getElementById('backToRoomList'); // 戻るボタン
    const chatRoomName = document.getElementById('chatRoomName'); // チャットルーム名
    const chatRoomEmoji = document.getElementById('chatRoomEmoji'); // チャットルーム絵文字
    const chatUserCount = document.getElementById('chatUserCount'); // チャットルームユーザー数

    // ルーム関連の要素
    // const roomTabs = document.getElementById('roomTabs'); // ルームタブコンテナ（削除）
    const createRoomBtn = document.getElementById('createRoomBtn'); // ルーム作成ボタン
    const createRoomModal = document.getElementById('createRoomModal'); // ルーム作成モーダル
    const roomNameInput = document.getElementById('roomName'); // ルーム名入力
    const roomDescriptionInput = document.getElementById('roomDescription'); // ルーム説明入力
    const emojiSelector = document.getElementById('emojiSelector'); // 絵文字選択エリア
    const cancelCreateRoom = document.getElementById('cancelCreateRoom'); // キャンセルボタン
    const confirmCreateRoom = document.getElementById('confirmCreateRoom'); // 作成ボタン

    // ========================================
    // ヘッダーに番号を表示
    // ========================================

    usernameDisplay.textContent = displayNumber;

    // ========================================
    // Firebase Databaseの参照を取得
    // ========================================

    // Firebaseの初期化を待機
    function waitForFirebase() {
        return new Promise((resolve) => {
            if (window.firebaseDatabase) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.firebaseDatabase) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 50); // 50msごとにチェック
            }
        });
    }

    // Firebase初期化を待ってから実行
    await waitForFirebase();
    console.log('✅ Firebase初期化完了を確認');
    console.log('🔍 roomCardsContainer:', roomCardsContainer);

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
    let selectedCategory = 'chat'; // 選択されたカテゴリ（デフォルト：雑談）
    let roomUserListeners = {}; // 各ルームタブのユーザー数リスナーを管理
    let lastScrollLeft = 0; // スクロール位置の記録（スクロール検出用）
    let isScrolling = false; // スクロール中フラグ（グローバルで管理）

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
    // ビュー切り替え機能
    // ========================================

    // ルーム一覧ビューを表示
    function showRoomListView() {
        roomListView.style.display = 'block';
        chatView.style.display = 'none';

        // カテゴリーバーを表示
        document.querySelector('.category-bar').style.display = 'block';

        console.log('ルーム一覧ビューを表示');
    }

    // チャットビューを表示
    function showChatView(roomId, roomName, roomEmoji) {
        roomListView.style.display = 'none';
        chatView.style.display = 'flex';
        chatRoomName.textContent = roomName;
        chatRoomEmoji.textContent = roomEmoji;

        // カテゴリーバーを非表示
        document.querySelector('.category-bar').style.display = 'none';

        console.log('チャットビューを表示:', roomName);
    }

    // 戻るボタンのクリックイベント
    backToRoomList.addEventListener('click', async () => {
        // 現在のルームから退出
        if (currentRoomId) {
            await leaveRoom(currentRoomId);
            currentRoomId = null;
        }
        showRoomListView();
    });

    // ========================================
    // カテゴリ機能
    // ========================================

    // アクティブタブのインジケーター（下線）を更新
    function updateCategoryIndicator() {
        const activeTab = document.querySelector('.category-tab.active');
        const tabsContainer = document.querySelector('.category-tabs');

        if (activeTab && tabsContainer) {
            const tabRect = activeTab.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();
            const left = activeTab.offsetLeft;
            const width = activeTab.offsetWidth;

            // CSS変数で位置とサイズを設定
            tabsContainer.style.setProperty('--indicator-left', `${left}px`);
            tabsContainer.style.setProperty('--indicator-width', `${width}px`);

            // ::after擬似要素のスタイルを更新
            const styleEl = document.getElementById('category-indicator-style') || document.createElement('style');
            styleEl.id = 'category-indicator-style';
            styleEl.textContent = `
                .category-tabs::after {
                    left: ${left}px !important;
                    width: ${width}px !important;
                }
            `;
            if (!document.getElementById('category-indicator-style')) {
                document.head.appendChild(styleEl);
            }
        }
    }

    // カテゴリタブのクリックイベント
    categoryTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-tab')) {
            // 全てのタブからactiveクラスを削除
            document.querySelectorAll('.category-tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // クリックされたタブにactiveクラスを追加
            e.target.classList.add('active');

            // インジケーターを更新
            updateCategoryIndicator();

            // 選択されたカテゴリを更新
            selectedCategory = e.target.dataset.category;
            console.log('カテゴリ切り替え:', selectedCategory);

            // そのカテゴリーのセクションまでスクロール
            isScrolling = true;
            const targetHeader = document.querySelector(`.category-section-header[data-category="${selectedCategory}"]`);
            if (targetHeader) {
                roomListView.scrollTo({
                    top: targetHeader.offsetTop - 10,
                    behavior: 'smooth'
                });
            }

            setTimeout(() => {
                isScrolling = false;
            }, 500);
        }
    });

    // 初期表示時にインジケーターを設定
    setTimeout(updateCategoryIndicator, 100);

    // スクロール連動でカテゴリータブを自動切り替え（Yahoo!ニュース風）
    let isScrolling = false;
    let scrollTimeout;

    roomListView.addEventListener('scroll', () => {
        if (isScrolling) return;

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // 現在表示中のカテゴリーヘッダーを検出
            const headers = document.querySelectorAll('.category-section-header');
            const scrollTop = roomListView.scrollTop;

            let activeCategory = 'chat'; // デフォルト

            headers.forEach(header => {
                const rect = header.getBoundingClientRect();
                const containerRect = roomListView.getBoundingClientRect();

                // ヘッダーが画面上部付近にある場合
                if (rect.top <= containerRect.top + 100) {
                    activeCategory = header.dataset.category;
                }
            });

            // カテゴリータブを更新
            if (selectedCategory !== activeCategory) {
                isScrolling = true;
                selectedCategory = activeCategory;

                // タブを切り替え
                document.querySelectorAll('.category-tab').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.category === activeCategory) {
                        tab.classList.add('active');
                    }
                });

                // インジケーターを更新
                updateCategoryIndicator();

                setTimeout(() => {
                    isScrolling = false;
                }, 100);
            }
        }, 50);
    }, { passive: true });

    // ========================================
    // ルーム機能
    // ========================================

    // 最近コメントしたルームを記録
    function saveRecentlyCommentedRoom(roomId) {
        // 最近コメントしたルームのリストを取得（最大5件）
        let recentRooms = JSON.parse(localStorage.getItem('netcity_recentRooms') || '[]');

        // 既に存在する場合は削除
        recentRooms = recentRooms.filter(id => id !== roomId);

        // 先頭に追加
        recentRooms.unshift(roomId);

        // 最大5件まで保持
        if (recentRooms.length > 5) {
            recentRooms = recentRooms.slice(0, 5);
        }

        // 保存
        localStorage.setItem('netcity_recentRooms', JSON.stringify(recentRooms));
    }

    // 最近コメントしたルームのリストを取得
    function getRecentlyCommentedRooms() {
        return JSON.parse(localStorage.getItem('netcity_recentRooms') || '[]');
    }

    // 固定ルームの定義
    const permanentRooms = [
        // 雑談カテゴリ
        { id: 'plaza', name: 'フリートーク', emoji: '🏠', category: 'chat', description: 'みんなで自由に雑談しよう', maxUsers: 50 },
        { id: 'night_talk', name: '夜のひとりごと', emoji: '🌙', category: 'chat', description: '夜更かしさん集まれ', maxUsers: 50 },
        // 相談カテゴリ
        { id: 'consultation_room', name: '心の相談室', emoji: '💭', category: 'consultation', description: '悩みを相談できる場所', maxUsers: 50 },
        { id: 'complaint_room', name: '愚痴聞きます', emoji: '😤', category: 'consultation', description: '愚痴を吐き出してスッキリ', maxUsers: 50 },
        // 恋愛カテゴリ
        { id: 'love_talk', name: '恋バナルーム', emoji: '💕', category: 'love', description: '恋愛トークで盛り上がろう', maxUsers: 50 },
        { id: 'heartbreak_cafe', name: '失恋カフェ', emoji: '💔', category: 'love', description: '失恋の傷を癒す場所', maxUsers: 50 },
        // 時事カテゴリ
        { id: 'current_topics', name: '今の話題', emoji: '📰', category: 'news', description: '最新ニュースについて語ろう', maxUsers: 50 },
        { id: 'sports_news', name: 'スポーツニュース', emoji: '⚽', category: 'news', description: 'スポーツの話題で盛り上がろう', maxUsers: 50 },
        // 人生カテゴリ
        { id: 'life_talk', name: '人生トーク', emoji: '🌱', category: 'life', description: '人生について語り合おう', maxUsers: 50 },
        { id: 'self_reflection', name: '自分を見つめる', emoji: '🪞', category: 'life', description: '自分自身と向き合う場所', maxUsers: 50 },
        // 趣味カテゴリ
        { id: 'music_anime', name: '音楽/アニメ', emoji: '🎵', category: 'hobby', description: '音楽やアニメについて語ろう', maxUsers: 50 },
        { id: 'game_talk', name: 'ゲームトーク', emoji: '🎮', category: 'hobby', description: 'ゲーム好き集まれ！', maxUsers: 50 }
    ];

    // ルームの初期化
    async function initializeRooms() {
        try {
            console.log('🚀 ルーム初期化開始...');
            console.log('固定ルーム定義:', permanentRooms);

            // 固定ルームを全て作成または確認
            let createdCount = 0;
            let existingCount = 0;
            let errorCount = 0;

            for (const room of permanentRooms) {
                try {
                    const roomRef = ref(database, `rooms/${room.id}`);
                    const roomSnapshot = await get(roomRef);

                    if (!roomSnapshot.exists()) {
                        // ルームが存在しない場合は作成
                        console.log(`✨ ${room.name}(${room.category})を新規作成します...`);
                        const roomData = {
                            id: room.id,
                            name: room.name,
                            emoji: room.emoji,
                            category: room.category,
                            description: room.description,
                            maxUsers: room.maxUsers,
                            currentUsers: 0,
                            isPermanent: true,
                            createdAt: Date.now(),
                            createdBy: 'system'
                        };
                        console.log('作成データ:', roomData);
                        await set(roomRef, roomData);
                        console.log(`✅ ${room.name}の作成完了`);
                        createdCount++;
                    } else {
                        console.log(`📋 ${room.name}(${room.category})は既に存在します`);
                        existingCount++;
                    }
                } catch (roomError) {
                    console.error(`❌ ${room.name}の作成エラー:`, roomError);
                    console.error('エラー詳細:', roomError.message, roomError.stack);
                    errorCount++;
                }
            }

            console.log(`📊 固定ルーム処理結果: 新規作成=${createdCount}, 既存=${existingCount}, エラー=${errorCount}`);

            // エラーが発生した場合はユーザーに通知
            if (errorCount > 0) {
                console.error(`⚠️ ${errorCount}個の固定ルームの作成に失敗しました。ネットワーク接続を確認してください。`);
            }

            // 最初に一度ルーム一覧を取得
            console.log('📥 ルーム一覧を取得中...');
            const roomsSnapshot = await get(roomsRef);
            const rooms = roomsSnapshot.val();

            if (rooms) {
                console.log('✅ ルーム一覧を取得しました:', Object.keys(rooms));
                console.log('ルーム詳細:', rooms);
                roomsCache = rooms;
                // ルームカードを表示
                updateRoomCards(rooms);
            } else {
                console.warn('⚠️ ルームが1つもありません（固定ルームの作成を待っています）');
                // 空の状態で表示を更新（ウェルカムメッセージが表示される）
                roomsCache = {};
                updateRoomCards({});
            }

            // ルーム一覧をリアルタイムで監視
            console.log('👀 ルーム一覧のリアルタイム監視を開始');
            onValue(roomsRef, (snapshot) => {
                const updatedRooms = snapshot.val();
                if (updatedRooms) {
                    console.log('🔄 ルーム一覧が更新されました');
                    roomsCache = updatedRooms;
                    updateRoomCards(updatedRooms);
                    updateSidebarRoomList(updatedRooms);
                    updateMyRoomsList(updatedRooms);
                }
            });

            console.log('✅ ルーム初期化完了');

        } catch (error) {
            console.error('❌ ルーム初期化エラー:', error);
            console.error('エラー詳細:', error.message, error.stack);
            alert('ルームの初期化に失敗しました。ページを再読み込みしてください。\nエラー: ' + error.message);
        }
    }

    // ルームタブの表示を更新（削除：ルームタブバーを削除したため）
    // function updateRoomTabs(rooms) { ... }

    // ルームカードの表示を更新
    function updateRoomCards(rooms) {
        console.log('🎯 updateRoomCards呼び出し, rooms:', rooms);
        console.log('🎯 roomCardsContainer exists:', !!roomCardsContainer);

        if (!roomCardsContainer) {
            console.error('❌ roomCardsContainerが見つかりません！');
            return;
        }

        roomCardsContainer.innerHTML = ''; // 既存のカードをクリア

        // ルームを配列に変換
        let roomArray = Object.values(rooms);
        console.log('全ルーム数:', roomArray.length);

        // カテゴリー別にグループ化
        const categories = ['chat', 'consultation', 'love', 'news', 'life', 'hobby'];
        const roomsByCategory = {};
        categories.forEach(cat => {
            roomsByCategory[cat] = roomArray.filter(r => r.category === cat);
        });

        // カテゴリー順にルームを表示（Yahoo!ニュース風）
        const categoryNames = {
            'chat': '💬 雑談',
            'consultation': '🤝 相談',
            'love': '💕 恋愛',
            'news': '📰 時事',
            'life': '🌱 人生',
            'hobby': '🎨 趣味'
        };

        categories.forEach(cat => {
            const rooms = roomsByCategory[cat];
            if (rooms && rooms.length > 0) {
                // カテゴリーヘッダーを作成
                const header = document.createElement('div');
                header.className = 'category-section-header';
                header.dataset.category = cat;
                header.textContent = categoryNames[cat];
                roomCardsContainer.appendChild(header);

                // 各ルームのソート
                rooms.sort((a, b) => {
                    if (a.isPermanent && !b.isPermanent) return -1;
                    if (!a.isPermanent && b.isPermanent) return 1;
                    if (a.isPermanent && b.isPermanent) {
                        return a.createdAt - b.createdAt;
                    }

                    const now = Date.now();
                    const daysOldA = (now - a.createdAt) / (24 * 60 * 60 * 1000);
                    const daysOldB = (now - b.createdAt) / (24 * 60 * 60 * 1000);

                    let scoreA = (a.currentUsers || 0) * 100 + Math.max(0, 7 - daysOldA) * 20;
                    let scoreB = (b.currentUsers || 0) * 100 + Math.max(0, 7 - daysOldB) * 20;

                    if (a.maxUsers > 0 && (a.currentUsers || 0) >= a.maxUsers) scoreA *= 0.5;
                    if (b.maxUsers > 0 && (b.currentUsers || 0) >= b.maxUsers) scoreB *= 0.5;

                    return scoreB - scoreA;
                });

                // ルームカードを追加
                rooms.forEach(room => {
                    const card = createRoomCard(room);
                    roomCardsContainer.appendChild(card);
                });
            }
        });
    }

    // ルームカードを作成
    function createRoomCard(room) {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.dataset.roomId = room.id;
        card.dataset.category = room.category; // カテゴリー情報を追加

        // ユーザー数を取得
        const currentUsers = room.currentUsers || 0;
        const maxUsers = room.maxUsers;
        const isFull = maxUsers > 0 && currentUsers >= maxUsers;

        if (isFull) {
            card.classList.add('full');
        }

        card.innerHTML = `
            <div class="room-card-content">
                <div class="room-card-main">
                    <div class="room-card-name">${room.name}</div>
                    ${room.description ? `<div class="room-card-description">${room.description}</div>` : ''}
                </div>
                <div class="room-card-side">
                    <div class="room-card-users">${currentUsers}人</div>
                </div>
            </div>
        `;

        // クリックイベント
        card.addEventListener('click', async () => {
            if (!isFull || room.id === currentRoomId) {
                // ルームに入室してチャット画面に遷移
                showChatView(room.id, room.name, room.emoji);
                await joinRoom(room.id);
            } else {
                alert('このルームは満員です');
            }
        });

        return card;
    }

    // サイドバーのルーム一覧を更新
    function updateSidebarRoomList(rooms) {
        const roomListContainer = document.getElementById('roomListContainer');
        if (!roomListContainer) return;

        // ルームを配列に変換
        let roomArray = Object.values(rooms);

        // カテゴリでフィルタリング
        roomArray = roomArray.filter(r => {
            return r.category === selectedCategory; // 選択されたカテゴリのルームのみ表示
        });

        // 固定ルームを最初に、その後は人気スコア順
        roomArray.sort((a, b) => {
            // 固定ルームは最初（isPermanentがtrueのもの）
            if (a.isPermanent && !b.isPermanent) return -1;
            if (!a.isPermanent && b.isPermanent) return 1;

            // 両方とも固定ルームの場合、作成日時順（古い順）
            if (a.isPermanent && b.isPermanent) {
                return a.createdAt - b.createdAt;
            }

            // 人気スコア = (ユーザー数 × 100) + (7 - 経過日数) × 20
            const now = Date.now();
            const daysOldA = (now - a.createdAt) / (24 * 60 * 60 * 1000);
            const daysOldB = (now - b.createdAt) / (24 * 60 * 60 * 1000);

            let scoreA = (a.currentUsers || 0) * 100 + Math.max(0, 7 - daysOldA) * 20;
            let scoreB = (b.currentUsers || 0) * 100 + Math.max(0, 7 - daysOldB) * 20;

            // 満員のルームはスコアを半減（参加できないため）
            if (a.maxUsers > 0 && (a.currentUsers || 0) >= a.maxUsers) {
                scoreA = scoreA * 0.5;
            }
            if (b.maxUsers > 0 && (b.currentUsers || 0) >= b.maxUsers) {
                scoreB = scoreB * 0.5;
            }

            return scoreB - scoreA;
        });

        // コンテナをクリア
        roomListContainer.innerHTML = '';

        // 各ルームの情報を表示
        if (roomArray.length > 0) {
            roomArray.forEach(room => {
                const roomItem = document.createElement('div');
                roomItem.className = 'sidebar-room-item';
                if (room.id === currentRoomId) {
                    roomItem.classList.add('current');
                }
                // 満員の場合は特別なクラスを追加
                if (room.maxUsers > 0 && (room.currentUsers || 0) >= room.maxUsers) {
                    roomItem.classList.add('full');
                }

                roomItem.innerHTML = `
                    <div class="sidebar-room-info">
                        <span class="sidebar-room-icon">${room.emoji || '💬'}</span>
                        <div class="sidebar-room-details">
                            <div class="sidebar-room-name">${room.name}</div>
                            <div class="sidebar-room-meta">
                                <span class="sidebar-room-users">👤 ${room.currentUsers || 0}/${room.maxUsers || 30}</span>
                            </div>
                        </div>
                    </div>
                `;

                // クリックでルームに移動
                roomItem.addEventListener('click', () => {
                    joinRoom(room.id);
                    // メニューを閉じる
                    document.getElementById('sidebarMenu').classList.remove('active');
                    document.getElementById('sidebarOverlay').classList.remove('active');
                });

                roomListContainer.appendChild(roomItem);
            });
        } else {
            // ルームがない場合
            roomListContainer.innerHTML = '<div class="room-list-loading">ルームがありません</div>';
        }
    }

    // サイドバーの「自分のルーム」を更新
    function updateMyRoomsList(rooms) {
        const myRoomsContainer = document.getElementById('myRoomsContainer');
        if (!myRoomsContainer) return;

        // 自分が作成したルームを抽出
        const myRooms = Object.values(rooms).filter(room => room.createdBy === userId && !room.isPermanent);

        // コンテナをクリア
        myRoomsContainer.innerHTML = '';

        if (myRooms.length === 0) {
            myRoomsContainer.innerHTML = '<div class="my-rooms-empty">作成したルームはありません</div>';
            return;
        }

        // 自分のルームを表示
        myRooms.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = 'my-room-item';

            // 期限までの残り日数を計算
            const now = Date.now();
            const expiresAt = room.expiresAt || (room.createdAt + (7 * 24 * 60 * 60 * 1000));
            const daysLeft = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));

            roomItem.innerHTML = `
                <div class="my-room-info">
                    <span class="my-room-icon">${room.emoji || '💬'}</span>
                    <div class="my-room-details">
                        <div class="my-room-name">${room.name}</div>
                        <div class="my-room-expires">期限: あと${daysLeft}日</div>
                    </div>
                    <button class="delete-room-btn" data-room-id="${room.id}" title="削除">
                        🗑️
                    </button>
                </div>
            `;

            // 削除ボタンのイベント
            const deleteBtn = roomItem.querySelector('.delete-room-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`ルーム「${room.name}」を削除しますか？\nこの操作は取り消せません。`)) {
                    await deleteRoom(room.id);
                }
            });

            // ルーム名クリックで移動
            roomItem.querySelector('.my-room-info').addEventListener('click', () => {
                joinRoom(room.id);
                // メニューを閉じる
                document.getElementById('sidebarMenu').classList.remove('active');
                document.getElementById('sidebarOverlay').classList.remove('active');
            });

            myRoomsContainer.appendChild(roomItem);
        });
    }

    // ルーム削除関数
    async function deleteRoom(roomId) {
        try {
            await remove(ref(database, `rooms/${roomId}`));
            await remove(ref(database, `roomUsers/${roomId}`));
            await remove(ref(database, `roomMessages/${roomId}`));
            console.log(`ルーム ${roomId} を削除しました`);

            // 削除したルームにいた場合は広場に移動
            if (currentRoomId === roomId) {
                await joinRoom('plaza');
            }
        } catch (error) {
            console.error('ルーム削除エラー:', error);
            alert('ルームの削除に失敗しました');
        }
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

        // 最近コメントしたルームの場合はrecentクラスを追加
        const recentRooms = getRecentlyCommentedRooms();
        if (recentRooms.includes(room.id)) {
            tab.classList.add('recent');
        }

        // 人数を取得（リアルタイムで更新）
        const userCountSpan = document.createElement('span');
        userCountSpan.className = 'room-count';

        // ルームのユーザー数を監視（リスナーを保存）
        const roomUserRef = ref(database, `roomUsers/${room.id}`);
        const unsubscribe = onValue(roomUserRef, (snapshot) => {
            const users = snapshot.val();
            const count = users ? Object.keys(users).length : 0;

            // 「家」（固定ルーム）以外はFirebaseのルームデータにcurrentUsersを保存（並び順用）
            if (!room.isPermanent) {
                const roomRef = ref(database, `rooms/${room.id}/currentUsers`);
                set(roomRef, count);
            }

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
            // スクロール中のタップは無視（誤タップ防止）
            if (isScrolling) {
                console.log('スクロール中のため、タップを無視しました');
                return;
            }

            if (!tab.classList.contains('full') || room.id === currentRoomId) {
                // ルームに入室（joinRoom内でスクロールとフラグ制御が処理される）
                joinRoom(room.id);
            }
        });

        return tab;
    }

    // タブを中央にスクロールする関数
    function scrollTabToCenter(tab) {
        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = roomTabs.offsetWidth;
        const scrollPosition = tabLeft - (containerWidth / 2) + (tabWidth / 2);

        roomTabs.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
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

            // メッセージエリアをクリア
            messagesArea.innerHTML = '<div class="welcome-message"><p>ルームに入室しました</p></div>';

            // ユーザー情報を登録
            const userRef = ref(database, `roomUsers/${roomId}/${userId}`);
            await set(userRef, {
                userId: userId,  // セキュリティルールでチェック用
                userNumber: parseInt(userNumber),  // 数値型に変換
                displayNumber: displayNumber,
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

            // 選択されたルームタブをスクロールして見やすい位置に
            // スクロールによる自動切り替えを防ぐため、フラグを立てる
            isAutoSwitching = true;
            scrollToActiveRoomTab(roomId);
            // スクロール完了後にフラグをリセット（smoothスクロールの完了を待つ）
            setTimeout(() => {
                isAutoSwitching = false;
            }, 500);

            // フェードインアニメーション開始
            messagesArea.classList.remove('fade-out');
            messagesArea.classList.add('fade-in');
            inputArea.classList.remove('fade-out');
            inputArea.classList.add('fade-in');

            console.log(`ルーム「${roomId}」に入室しました`);

        } catch (error) {
            console.error('ルーム入室エラー:', error);
            alert('ルームへの入室に失敗しました');
            // エラー時もフェードインして画面を戻す
            messagesArea.classList.remove('fade-out');
            messagesArea.classList.add('fade-in');
            inputArea.classList.remove('fade-out');
            inputArea.classList.add('fade-in');
        }
    }

    // ルームから退出
    async function leaveRoom(roomId) {
        const userRef = ref(database, `roomUsers/${roomId}/${userId}`);
        await remove(userRef);
    }

    // 選択されたルームタブをスクロールして見やすい位置に移動
    function scrollToActiveRoomTab(roomId) {
        const activeTab = document.querySelector(`.room-tab[data-room-id="${roomId}"]`);
        if (!activeTab) return;

        // タブを中央にスクロール
        scrollTabToCenter(activeTab);

        console.log(`ルームタブを中央にスクロール: ${roomId}`);
    }

    // ルームのメッセージを読み込み
    function loadRoomMessages(roomId) {
        // 最新50件のみを読み込むクエリ（パフォーマンス改善）
        const roomMessagesRef = ref(database, `roomMessages/${roomId}`);
        const messagesQuery = query(
            roomMessagesRef,
            orderByChild('timestamp'),
            limitToLast(50)
        );

        // 一度だけ実行してウェルカムメッセージを消す
        let isFirstMessage = true;

        // メッセージの追加を監視（最新50件のみ）
        const unsubscribeAdded = onChildAdded(messagesQuery, (snapshot) => {
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

        // メッセージの変更を監視（編集、最新50件のみ）
        const unsubscribeChanged = onChildChanged(messagesQuery, (snapshot) => {
            const message = snapshot.val();
            const messageId = snapshot.key;
            const existingMessageDiv = messagesArea.querySelector(`[data-message-id="${messageId}"]`);

            if (existingMessageDiv) {
                // 既存のメッセージを更新（スクロール位置を保持）
                const scrollPosition = messagesArea.scrollTop;
                const scrollHeight = messagesArea.scrollHeight;
                const isAtBottom = scrollHeight - scrollPosition - messagesArea.clientHeight < 50;

                // 編集されたメッセージの内容を更新
                const messageContent = existingMessageDiv.querySelector('.message-content');
                if (messageContent) {
                    // 編集UIがある場合は削除
                    const editContainer = messageContent.querySelector('.message-edit-container');
                    if (editContainer) {
                        editContainer.remove();
                    }

                    // メッセージを更新
                    const escapedText = escapeHtml(message.text);
                    const linkedText = linkifyText(escapedText);
                    messageContent.innerHTML = linkedText;
                }

                // スクロール位置を復元
                if (isAtBottom) {
                    messagesArea.scrollTop = messagesArea.scrollHeight;
                } else {
                    messagesArea.scrollTop = scrollPosition;
                }
            }
        });

        // メッセージの削除を監視（最新50件のみ）
        const unsubscribeRemoved = onChildRemoved(messagesQuery, (snapshot) => {
            const messageId = snapshot.key;
            const existingMessageDiv = messagesArea.querySelector(`[data-message-id="${messageId}"]`);

            if (existingMessageDiv) {
                existingMessageDiv.remove();
                console.log(`メッセージを画面から削除: ${messageId}`);
            }
        });

        // リスナーを保存（複数のリスナーを管理）
        currentMessagesListener = () => {
            unsubscribeAdded();
            unsubscribeChanged();
            unsubscribeRemoved();
        };
    }

    // ========================================
    // メッセージ送信の処理
    // ========================================

    // 送信ボタンをクリックした時
    sendButton.addEventListener('click', sendMessage);

    // PWA対策：入力欄をタップしたときに確実にフォーカス
    messageInput.addEventListener('touchstart', function(e) {
        // 入力欄を確実にフォーカス
        this.focus();
    }, { passive: true });

    // クリックイベントでもフォーカス（デスクトップ対応）
    messageInput.addEventListener('click', function() {
        this.focus();
    });

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

    function autoResizeTextarea() {
        messageInput.style.height = 'auto'; // 一旦リセット
        const newHeight = Math.min(messageInput.scrollHeight, 150); // 最大高さを150pxに制限
        messageInput.style.height = newHeight + 'px';
    }

    // 入力時に自動リサイズを実行
    messageInput.addEventListener('input', autoResizeTextarea);

    // ========================================
    // 入力のサニタイズ（XSS対策）
    // ========================================
    function sanitizeInput(text) {
        // 基本的なHTMLタグを無害化
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // メッセージのバリデーション
    // ========================================
    function validateMessage(text) {
        // 空文字チェック
        if (!text || text.trim() === '') {
            return { valid: false, error: 'メッセージを入力してください' };
        }

        // 長さチェック（1-200文字）
        if (text.length > 200) {
            return { valid: false, error: 'メッセージは200文字以内で入力してください' };
        }

        // 禁止文字チェック（制御文字など）
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text)) {
            return { valid: false, error: '不正な文字が含まれています' };
        }

        return { valid: true };
    }

    // ========================================
    // メッセージを送信する関数
    // ========================================
    function sendMessage() {
        // 入力されたメッセージを取得（前後の空白を削除）
        const messageText = messageInput.value.trim();

        // バリデーション
        const validation = validateMessage(messageText);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // ルームに入室していない場合は送信しない
        if (!messagesRef) {
            console.error('ルームに入室していません');
            alert('ルームに入室してからメッセージを送信してください。');
            return;
        }

        // サニタイズ（XSS対策）
        const sanitizedText = sanitizeInput(messageText);

        // Firebaseに送信するデータ
        const messageData = {
            userId: userId,               // 送信者の固有ID（識別用）
            userNumber: parseInt(userNumber), // 送信者の番号（表示用、数値型に変換）
            displayNumber: displayNumber, // 表示用番号（No.XX）
            text: sanitizedText,          // サニタイズ済みメッセージ本文
            timestamp: serverTimestamp() // サーバーの時刻（自動で設定）
        };

        // Firebaseにデータを送信（push = 新しいデータを追加）
        push(messagesRef, messageData)
            .then(() => {
                // 送信成功
                console.log('メッセージを送信しました');
                messageInput.value = ''; // 入力欄をクリア
                messageInput.style.height = 'auto'; // 高さをリセット

                // コメント履歴を記録
                if (currentRoomId) {
                    saveRecentlyCommentedRoom(currentRoomId);
                }
            })
            .catch((error) => {
                // 送信失敗
                console.error('送信エラー:', error);
                alert('メッセージの送信に失敗しました。もう一度お試しください。');
            });
    }

    // ========================================
    // 古いメッセージの削除処理
    // ========================================

    // 7日間前のタイムスタンプを計算
    function getSevenDaysAgoTimestamp() {
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7日間のミリ秒
        return Date.now() - sevenDaysInMs;
    }

    // 古いメッセージを削除する関数（全ルーム対象）
    async function deleteOldMessages() {
        try {
            const sevenDaysAgo = getSevenDaysAgoTimestamp();
            console.log(`7日前のタイムスタンプ: ${sevenDaysAgo} (${new Date(sevenDaysAgo).toLocaleString()})`);

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

                        // タイムスタンプが存在し、7日間以上前の場合は削除
                        if (message.timestamp && message.timestamp < sevenDaysAgo) {
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

        // 自分のメッセージかどうかをチェック（固有IDで判定）
        const isOwnMessage = message.userId === userId;
        console.log(`メッセージ表示: userId="${message.userId}", 自分="${userId}", isOwnMessage=${isOwnMessage}`);
        if (isOwnMessage) {
            messageDiv.classList.add('own'); // 自分のメッセージには'own'クラスを追加
        }

        // 時刻をフォーマット（例: 14:30）
        const timeString = formatTime(message.timestamp);

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
        // 表示用番号がない場合は番号から生成
        const displayName = message.displayNumber || `No.${message.userNumber}`;
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-username">${escapeHtml(displayName)}</span>
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

        // 長押しでメニュー表示（LINEスタイル）
        let longPressTimer = null;
        let touchMoved = false;

        messageDiv.addEventListener('touchstart', (e) => {
            // リアクションボタンや他のボタンをタップした場合は長押しメニューを表示しない
            if (e.target.closest('.add-reaction-btn') ||
                e.target.closest('.reaction-item') ||
                e.target.closest('.message-link')) {
                return;
            }

            touchMoved = false;
            longPressTimer = setTimeout(() => {
                if (!touchMoved) {
                    // 長押し検出
                    const touch = e.touches[0];
                    showLongPressMenu(messageId, message, isOwnMessage, touch.clientX, touch.clientY);
                }
            }, 500); // 500ms長押しで反応
        }, { passive: true });

        messageDiv.addEventListener('touchmove', () => {
            touchMoved = true;
            clearTimeout(longPressTimer);
        }, { passive: true });

        messageDiv.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });

        messageDiv.addEventListener('touchcancel', () => {
            clearTimeout(longPressTimer);
        }, { passive: true });

        // 自動的に一番下までスクロール（新しいメッセージが見えるように）
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // 時刻を相対時間でフォーマットする関数（何分前、何時間前、何日前）
    function formatTime(timestamp) {
        if (!timestamp) return '送信中...';

        const now = Date.now();
        const diff = now - timestamp;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) {
            return 'たった今';
        } else if (minutes < 60) {
            return `${minutes}分前`;
        } else if (hours < 24) {
            return `${hours}時間前`;
        } else {
            return `${days}日前`;
        }
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

        // bodyに一旦追加してサイズを取得
        document.body.appendChild(picker);

        // ボタンの位置を取得
        const buttonRect = button.getBoundingClientRect();
        const pickerRect = picker.getBoundingClientRect();

        // 画面のサイズを取得
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 初期位置（ボタンの中央上）
        let left = buttonRect.left + buttonRect.width / 2 - pickerRect.width / 2;
        let top = buttonRect.top - pickerRect.height - 10;

        // 左端からはみ出る場合
        if (left < 10) {
            left = 10;
        }

        // 右端からはみ出る場合
        if (left + pickerRect.width > viewportWidth - 10) {
            left = viewportWidth - pickerRect.width - 10;
        }

        // 上端からはみ出る場合はボタンの下に表示
        if (top < 10) {
            top = buttonRect.bottom + 10;
        }

        // 下端からはみ出る場合
        if (top + pickerRect.height > viewportHeight - 10) {
            top = viewportHeight - pickerRect.height - 10;
        }

        // 位置を設定
        picker.style.left = `${left}px`;
        picker.style.top = `${top}px`;

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
    // メッセージの編集・削除機能
    // ========================================

    let currentMessageMenu = null;

    // 長押しメニューを表示（削除のみ）
    function showLongPressMenu(messageId, message, isOwnMessage, x, y) {
        // 自分のメッセージでない場合は何もしない
        if (!isOwnMessage || message.imageUrl) {
            return;
        }

        // 既存のメニューを閉じる
        if (currentMessageMenu) {
            currentMessageMenu.remove();
            currentMessageMenu = null;
        }

        // メニューを作成
        const menu = document.createElement('div');
        menu.className = 'long-press-menu active';

        // 削除オプションのみ
        menu.innerHTML = `
            <div class="message-menu-item delete" data-action="delete">
                <span class="menu-icon">🗑️</span>
                <span class="menu-text">削除</span>
            </div>
        `;

        // bodyに一旦追加してサイズを取得
        document.body.appendChild(menu);
        currentMessageMenu = menu;

        // メニューの位置を調整
        const menuRect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = x - menuRect.width / 2;
        let top = y - menuRect.height - 10;

        // 画面からはみ出ないように調整
        if (left < 10) left = 10;
        if (left + menuRect.width > viewportWidth - 10) {
            left = viewportWidth - menuRect.width - 10;
        }
        if (top < 10) top = y + 20; // 上にはみ出る場合は下に表示
        if (top + menuRect.height > viewportHeight - 10) {
            top = viewportHeight - menuRect.height - 10;
        }

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;

        // メニュー項目のクリックイベント
        menu.querySelectorAll('.message-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                if (action === 'delete') {
                    deleteMessage(messageId);
                }
                menu.remove();
                currentMessageMenu = null;
            });
        });

        // メニュー外をタップしたら閉じる
        setTimeout(() => {
            const closeMenuHandler = (e) => {
                if (currentMessageMenu && !currentMessageMenu.contains(e.target)) {
                    currentMessageMenu.remove();
                    currentMessageMenu = null;
                    document.removeEventListener('click', closeMenuHandler);
                    document.removeEventListener('touchstart', closeMenuHandler);
                }
            };
            document.addEventListener('click', closeMenuHandler);
            document.addEventListener('touchstart', closeMenuHandler);
        }, 100);
    }

    // メッセージメニューを表示（メニューボタンクリック用 - 削除のみ）
    // ※メニューボタン（⋮）を削除したため、この関数は使用されません
    // function showMessageMenu(messageId, message, button, isOwnMessage) {
    //     // 既存のメニューを閉じる
    //     if (currentMessageMenu) {
    //         currentMessageMenu.remove();
    //         currentMessageMenu = null;
    //         return;
    //     }

    //     // メニューを作成
    //     const menu = document.createElement('div');
    //     menu.className = 'message-menu active';

    //     // 削除のみ
    //     menu.innerHTML = `
    //         <div class="message-menu-item delete" data-action="delete">
    //             <span class="menu-icon">🗑️</span>
    //             <span class="menu-text">削除</span>
    //         </div>
    //     `;

    //     // ボタンの位置を取得してメニューを配置
    //     const buttonRect = button.getBoundingClientRect();
    //     menu.style.left = `${buttonRect.left}px`;
    //     menu.style.top = `${buttonRect.bottom + 5}px`;

    //     // bodyに追加
    //     document.body.appendChild(menu);
    //     currentMessageMenu = menu;

    //     // メニュー項目のクリックイベント
    //     menu.querySelectorAll('.message-menu-item').forEach(item => {
    //         item.addEventListener('click', (e) => {
    //             const action = e.currentTarget.dataset.action;
    //             if (action === 'delete') {
    //                 deleteMessage(messageId);
    //             }
    //             menu.remove();
    //             currentMessageMenu = null;
    //         });
    //     });

    //     // メニュー外をクリックしたら閉じる
    //     setTimeout(() => {
    //         document.addEventListener('click', function closeMenu(e) {
    //             if (currentMessageMenu && !currentMessageMenu.contains(e.target) && e.target !== button) {
    //                 currentMessageMenu.remove();
    //                 currentMessageMenu = null;
    //                 document.removeEventListener('click', closeMenu);
    //             }
    //         });
    //     }, 100);
    // }

    // メッセージを削除する
    async function deleteMessage(messageId) {
        if (!confirm('このメッセージを削除しますか？')) {
            return;
        }

        try {
            // メッセージを完全に削除（onChildRemovedが画面からも削除してくれる）
            const messageRef = ref(database, `roomMessages/${currentRoomId}/${messageId}`);
            await remove(messageRef);

            console.log('メッセージを削除しました');
        } catch (error) {
            console.error('メッセージ削除エラー:', error);
            alert('メッセージの削除に失敗しました');
        }
    }

    // メッセージを編集する（機能を無効化）
    // function editMessage(messageId, message) {
    //     const messageDiv = messagesArea.querySelector(`[data-message-id="${messageId}"]`);
    //     if (!messageDiv) return;

    //     const messageContent = messageDiv.querySelector('.message-content');
    //     if (!messageContent) return;

    //     // 編集用のテキストエリアを作成
    //     const currentText = message.text;
    //     const editContainer = document.createElement('div');
    //     editContainer.className = 'message-edit-container';
    //     editContainer.innerHTML = `
    //         <textarea class="message-edit-textarea" maxlength="200" placeholder="メッセージを編集...">${currentText}</textarea>
    //         <div class="message-edit-actions">
    //             <button class="btn-cancel-edit" title="キャンセル">✕</button>
    //             <button class="btn-save-edit" title="保存">✓</button>
    //         </div>
    //     `;

    //     // 元の内容を保存
    //     const originalHTML = messageContent.innerHTML;

    //     // 編集UIに切り替え
    //     messageContent.innerHTML = '';
    //     messageContent.appendChild(editContainer);

    //     const textarea = editContainer.querySelector('.message-edit-textarea');
    //     textarea.focus();
    //     textarea.setSelectionRange(textarea.value.length, textarea.value.length); // カーソルを最後に

    //     // 保存ボタン
    //     editContainer.querySelector('.btn-save-edit').addEventListener('click', async () => {
    //         const newText = textarea.value.trim();
    //         if (!newText) {
    //             alert('メッセージを入力してください');
    //             return;
    //         }

    //         if (newText === currentText) {
    //             // 変更がない場合は元に戻す
    //             messageContent.innerHTML = originalHTML;
    //             return;
    //         }

    //         try {
    //             const messageRef = ref(database, `roomMessages/${currentRoomId}/${messageId}`);
    //             await update(messageRef, {
    //                 text: newText
    //                 // editedフラグは立てない
    //             });

    //             console.log('メッセージを編集しました');
    //         } catch (error) {
    //             console.error('メッセージ編集エラー:', error);
    //             alert('メッセージの編集に失敗しました');
    //             messageContent.innerHTML = originalHTML;
    //         }
    //     });

    //     // キャンセルボタン
    //     editContainer.querySelector('.btn-cancel-edit').addEventListener('click', () => {
    //         messageContent.innerHTML = originalHTML;
    //     });

    //     // Enterキーで保存（Shift+Enterで改行）
    //     textarea.addEventListener('keydown', (e) => {
    //         if (e.key === 'Enter' && !e.shiftKey) {
    //             e.preventDefault();
    //             editContainer.querySelector('.btn-save-edit').click();
    //         } else if (e.key === 'Escape') {
    //             editContainer.querySelector('.btn-cancel-edit').click();
    //         }
    //     });
    // }

    // ========================================
    // ルーム内のオンライン人数の管理
    // ========================================
    // ※チャットヘッダーを削除したため、オンライン人数の表示は行わない

    // 現在のルームのユーザー数をリアルタイムで監視（内部処理のみ）
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
            } else {
                console.log('ルームにユーザーがいません');
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

    // ========================================
    // ルーム作成のバリデーション
    // ========================================
    function validateRoomData(roomName, description, emoji, maxUsers) {
        // ルーム名のバリデーション
        if (!roomName || roomName.trim() === '') {
            return { valid: false, error: 'ルーム名を入力してください' };
        }
        if (roomName.length < 1) {
            return { valid: false, error: 'ルーム名は1文字以上で入力してください' };
        }
        if (roomName.length > 15) {
            return { valid: false, error: 'ルーム名は15文字以内で入力してください' };
        }

        // 説明のバリデーション
        if (description && description.length > 50) {
            return { valid: false, error: '説明は50文字以内で入力してください' };
        }

        // 絵文字のバリデーション
        if (!emoji || emoji.length === 0) {
            return { valid: false, error: '絵文字を選択してください' };
        }

        // 最大人数のバリデーション
        const validMaxUsers = [10, 20, 30, 50];
        if (!validMaxUsers.includes(maxUsers)) {
            return { valid: false, error: '無効な最大人数です' };
        }

        // 禁止文字チェック（制御文字など）
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(roomName) ||
            /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(description)) {
            return { valid: false, error: '不正な文字が含まれています' };
        }

        return { valid: true };
    }

    // ルーム作成確定ボタン
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();
        const description = roomDescriptionInput.value.trim();

        // 選択されたmaxUsersを取得
        const maxUsersRadio = document.querySelector('input[name="maxUsers"]:checked');
        const maxUsers = parseInt(maxUsersRadio.value);

        // 選択されたカテゴリを取得
        const categoryRadio = document.querySelector('input[name="category"]:checked');
        const roomCategory = categoryRadio.value;

        // バリデーション
        const validation = validateRoomData(roomName, description, selectedEmoji, maxUsers);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            // 既存のルーム数をチェック（広場を除く）
            const roomsSnapshot = await get(roomsRef);
            const rooms = roomsSnapshot.val() || {};
            const customRooms = Object.values(rooms).filter(room => !room.isPermanent);

            if (customRooms.length >= 100) {
                alert('カスタムルームは最大100個までです');
                return;
            }

            // ユーザーが既にルームを作成していないかチェック（2つまで）
            const userCreatedRooms = customRooms.filter(room => room.createdBy === userId);
            if (userCreatedRooms.length >= 2) {
                alert('既にルームを2つ作成しています。作成できるルームは1人2つまでです。');
                return;
            }

            // ルームIDを生成
            const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // サニタイズ（XSS対策）
            const sanitizedRoomName = sanitizeInput(roomName);
            const sanitizedDescription = sanitizeInput(description);

            // ルームデータを作成
            const roomData = {
                id: roomId,
                name: sanitizedRoomName,
                emoji: selectedEmoji,
                category: roomCategory, // カテゴリを追加
                maxUsers: maxUsers,
                description: sanitizedDescription || '',
                isPermanent: false,
                createdAt: Date.now(),
                createdBy: userId,
                creatorNumber: displayNumber,
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7日後
                currentUsers: 0 // 初期ユーザー数
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
            const oneDayInMs = 24 * 60 * 60 * 1000; // 24時間
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7日間

            for (const roomId in rooms) {
                const room = rooms[roomId];

                // 固定ルーム（広場）はスキップ
                if (room.isPermanent) continue;

                // ルームのユーザー数を取得
                const roomUserRef = ref(database, `roomUsers/${roomId}`);
                const usersSnapshot = await get(roomUserRef);
                const users = usersSnapshot.val();
                const userCount = users ? Object.keys(users).length : 0;

                // 削除条件1: 24時間以上誰もいない
                const isEmptyForOneDay = userCount === 0 && (now - room.createdAt) > oneDayInMs;

                // 削除条件2: 作成から7日間経過（expiresAtがある場合はそれを優先）
                const isExpired = room.expiresAt ? now > room.expiresAt : (now - room.createdAt) > sevenDaysInMs;

                if (isEmptyForOneDay || isExpired) {
                    // ルームを削除
                    await remove(ref(database, `rooms/${roomId}`));
                    await remove(ref(database, `roomUsers/${roomId}`));
                    await remove(ref(database, `roomMessages/${roomId}`));

                    console.log(`ルーム「${room.name}」を自動削除しました（理由: ${isExpired ? '期限切れ' : '24時間以上空室'}）`);
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

    // 番号変更メニュークリック
    editNumberMenu.addEventListener('click', function() {
        closeSidebar();
        handleNumberChange();
    });

    // キャッシュクリアボタン
    const clearCacheMenu = document.getElementById('clearCacheMenu');
    clearCacheMenu.addEventListener('click', function() {
        closeSidebar();
        handleClearCache();
    });

    // キャッシュクリア処理
    function handleClearCache() {
        if (!confirm('キャッシュをクリアしてページを再読み込みしますか？\n最新の状態に更新されます。')) {
            return;
        }

        // Service Workerにキャッシュクリアを指示
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });

            // Service Workerからの応答を待つ
            navigator.serviceWorker.addEventListener('message', function handler(event) {
                if (event.data && event.data.type === 'CACHE_CLEARED') {
                    console.log('キャッシュがクリアされました');
                    navigator.serviceWorker.removeEventListener('message', handler);

                    // ページを強制リロード
                    window.location.reload(true);
                }
            });

            // タイムアウト処理（3秒後に強制リロード）
            setTimeout(() => {
                window.location.reload(true);
            }, 3000);
        } else {
            // Service Workerがない場合は通常のリロード
            window.location.reload(true);
        }
    }

    // 番号変更処理（1日1回まで）
    function handleNumberChange() {
        // 最終変更日を確認
        const lastChangeDate = localStorage.getItem('netcity_numberChangeDate');
        const today = new Date().toDateString();

        if (lastChangeDate === today) {
            alert('番号の変更は1日1回までです。明日また変更できます。');
            return;
        }

        // 番号変更の確認
        if (!confirm('番号を変更しますか？\n（1日1回まで変更可能）')) {
            return;
        }

        // 新しい番号を生成（1-999）
        const newNumber = Math.floor(Math.random() * 999) + 1;
        const newDisplayNumber = `No.${newNumber}`;

        // localStorageに保存
        localStorage.setItem('netcity_userNumber', newNumber.toString());
        localStorage.setItem('netcity_numberChangeDate', today);

        // 画面に反映
        usernameDisplay.textContent = newDisplayNumber;

        // グローバル変数を更新（注意：const で宣言されているため、この方法では動作しません）
        // 代わりに、ページをリロードして新しい番号を反映させます
        alert(`番号を ${newDisplayNumber} に変更しました！\nページを再読み込みします。`);
        window.location.reload();
    }

    // ========================================
    // テーマ切り替え
    // ========================================

    // localStorageからテーマを取得（デフォルトはライトモード）
    const savedTheme = localStorage.getItem('netcity_theme') || 'light';

    // 初期テーマを適用
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            lightModeBtn.classList.remove('active');
            neonModeBtn.classList.add('active');
        } else {
            document.body.classList.remove('dark-mode');
            lightModeBtn.classList.add('active');
            neonModeBtn.classList.remove('active');
        }
        localStorage.setItem('netcity_theme', theme);
        console.log('✅ テーマ適用:', theme);
    }

    // ページ読み込み時にテーマを適用
    applyTheme(savedTheme);

    // ライトモードボタンクリック
    lightModeBtn.addEventListener('click', function() {
        applyTheme('light');
    });

    // ダークモードボタンクリック（旧ネオンモード）
    neonModeBtn.addEventListener('click', function() {
        applyTheme('dark');
    });

    // ========================================
    // ルームタブの横スクロール干渉防止（削除済み：カテゴリタブに統合）
    // ========================================

    // ========================================
    // スクロール連動でルーム自動切り替え（ヤフーニュース風）
    // ========================================

    let scrollTimeout = null;
    let isAutoSwitching = false; // 自動切り替え中フラグ

    // スクロール連動機能を一時的に無効化
    // roomTabs.addEventListener('scroll', () => {
    //     // デバウンス処理（スクロール終了後に実行）
    //     clearTimeout(scrollTimeout);

    //     scrollTimeout = setTimeout(() => {
    //         if (isAutoSwitching) return; // 自動切り替え中はスキップ

    //         const scrollLeft = roomTabs.scrollLeft;
    //         const containerWidth = roomTabs.offsetWidth;
    //         const centerPosition = scrollLeft + containerWidth / 2;

    //         // すべてのタブを取得
    //         const tabs = Array.from(roomTabs.querySelectorAll('.room-tab'));

    //         // 中央に最も近いタブを検出
    //         let closestTab = null;
    //         let minDistance = Infinity;

    //         tabs.forEach(tab => {
    //             const tabLeft = tab.offsetLeft;
    //             const tabWidth = tab.offsetWidth;
    //             const tabCenter = tabLeft + tabWidth / 2;
    //             const distance = Math.abs(centerPosition - tabCenter);

    //             if (distance < minDistance) {
    //                 minDistance = distance;
    //                 closestTab = tab;
    //             }
    //         });

    //         // 中央のタブのルームIDを取得
    //         if (closestTab) {
    //             const roomId = closestTab.dataset.roomId;

    //             // 現在のルームと異なる場合のみ切り替え
    //             if (roomId && roomId !== currentRoomId) {
    //                 console.log(`スクロール連動: ルーム ${roomId} に自動切り替え`);
    //                 isAutoSwitching = true;
    //                 joinRoom(roomId).finally(() => {
    //                     // 切り替え完了後、フラグをリセット
    //                     setTimeout(() => {
    //                         isAutoSwitching = false;
    //                     }, 300);
    //                 });
    //             }
    //         }
    //     }, 150); // 150ms後に実行
    // }, { passive: true });

    // ========================================
    // スワイプ機能（Yahoo!ニュース風）
    // ========================================

    // カテゴリータブのスワイプ操作
    let categoryStartX = 0;
    let categoryStartY = 0;
    let categoryIsSwiping = false;

    roomCardsContainer.addEventListener('touchstart', (e) => {
        categoryStartX = e.touches[0].clientX;
        categoryStartY = e.touches[0].clientY;
        categoryIsSwiping = false;
    }, { passive: true });

    roomCardsContainer.addEventListener('touchmove', (e) => {
        if (!categoryStartX) return;

        const diffX = Math.abs(e.touches[0].clientX - categoryStartX);
        const diffY = Math.abs(e.touches[0].clientY - categoryStartY);

        // 横スワイプの方が大きければスワイプモード
        if (diffX > diffY && diffX > 30) {
            categoryIsSwiping = true;
        }
    }, { passive: true });

    roomCardsContainer.addEventListener('touchend', (e) => {
        if (!categoryIsSwiping || !categoryStartX) {
            categoryStartX = 0;
            categoryStartY = 0;
            return;
        }

        const diffX = e.changedTouches[0].clientX - categoryStartX;
        const threshold = 50; // スワイプの閾値

        if (Math.abs(diffX) > threshold) {
            const currentTab = document.querySelector('.category-tab.active');
            const tabs = Array.from(document.querySelectorAll('.category-tab'));
            const currentIndex = tabs.indexOf(currentTab);

            if (diffX < 0 && currentIndex < tabs.length - 1) {
                // 左スワイプ → 次のカテゴリ
                tabs[currentIndex + 1].click();
            } else if (diffX > 0 && currentIndex > 0) {
                // 右スワイプ → 前のカテゴリ
                tabs[currentIndex - 1].click();
            }
        }

        categoryStartX = 0;
        categoryStartY = 0;
        categoryIsSwiping = false;
    }, { passive: true });

    // チャットビューからホームへのスワイプ操作
    let chatStartX = 0;
    let chatStartY = 0;
    let chatIsSwiping = false;
    let chatSwipeProgress = 0;

    chatView.addEventListener('touchstart', (e) => {
        // メッセージエリアの一番上でのみスワイプを有効化
        if (messagesArea.scrollTop <= 0) {
            chatStartX = e.touches[0].clientX;
            chatStartY = e.touches[0].clientY;
            chatIsSwiping = false;
            chatSwipeProgress = 0;
        }
    }, { passive: true });

    chatView.addEventListener('touchmove', (e) => {
        if (!chatStartX || messagesArea.scrollTop > 0) return;

        const diffX = e.touches[0].clientX - chatStartX;
        const diffY = Math.abs(e.touches[0].clientY - chatStartY);

        // 右スワイプで戻る（横スワイプが縦より大きい）
        if (diffX > 0 && diffX > diffY && diffX > 20) {
            chatIsSwiping = true;
            chatSwipeProgress = Math.min(diffX / 200, 1); // 200pxで完了

            // スワイプのビジュアルフィードバック
            chatView.style.transform = `translateX(${diffX * 0.3}px)`;
            chatView.style.transition = 'none';
        }
    }, { passive: true });

    chatView.addEventListener('touchend', (e) => {
        if (!chatIsSwiping || !chatStartX) {
            chatStartX = 0;
            chatStartY = 0;
            chatView.style.transform = '';
            chatView.style.transition = '';
            return;
        }

        const diffX = e.changedTouches[0].clientX - chatStartX;
        const threshold = 80; // スワイプの閾値

        // リセット
        chatView.style.transition = 'transform 0.3s ease';
        chatView.style.transform = '';

        if (diffX > threshold) {
            // 戻るボタンをクリック
            setTimeout(() => {
                document.getElementById('backToRoomList').click();
            }, 100);
        }

        chatStartX = 0;
        chatStartY = 0;
        chatIsSwiping = false;
        chatSwipeProgress = 0;
    }, { passive: true });

    // ========================================
    // 初期化
    // ========================================

    // ルーム機能を初期化
    initializeRooms();

    // 入力欄にフォーカス
    messageInput.focus(); // カーソルを入力欄に自動で移動

});
