// ========================================
// NET CITY β - お気に入り機能
// ========================================

// お気に入り管理クラス
class FavoritesManager {
    constructor() {
        this.STORAGE_KEY = 'netcity_favorites';
        this.favorites = this.loadFavorites();
    }

    // お気に入りを読み込み
    loadFavorites() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // お気に入りを保存
    saveFavorites() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favorites));
    }

    // お気に入りに追加
    add(roomId) {
        if (!this.favorites.includes(roomId)) {
            this.favorites.push(roomId);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // お気に入りから削除
    remove(roomId) {
        const index = this.favorites.indexOf(roomId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // お気に入りかどうかチェック
    isFavorited(roomId) {
        return this.favorites.includes(roomId);
    }

    // お気に入り切り替え
    toggle(roomId) {
        if (this.isFavorited(roomId)) {
            this.remove(roomId);
            return false;
        } else {
            this.add(roomId);
            return true;
        }
    }

    // 全てのお気に入りを取得
    getAll() {
        return [...this.favorites];
    }
}

// グローバルインスタンス
window.favoritesManager = new FavoritesManager();

// 初期化関数（即座に実行）
(function initFavorites() {
    console.log('✅ お気に入り機能を初期化');

    // モーダル関連の要素
    const favoritesModal = document.getElementById('favoritesModal');
    const favoritesList = document.getElementById('favoritesList');
    const closeFavoritesModal = document.getElementById('closeFavoritesModal');
    const favoritesBtn = document.querySelector('.nav-item[data-tab="favorites"]');

    // お気に入りボタンをクリックするとモーダルを表示
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log('お気に入りモーダルを表示');
            showFavoritesModal();
        });
    }

    // モーダルを閉じる関数
    function closeFavoritesModalFunc() {
        favoritesModal.classList.remove('active');
        // ボタンのアクティブ状態を解除
        if (favoritesBtn) {
            favoritesBtn.classList.remove('active');
        }
    }

    // モーダルを閉じる
    if (closeFavoritesModal) {
        closeFavoritesModal.addEventListener('click', closeFavoritesModalFunc);
    }

    // モーダルの外側をクリックしても閉じる
    if (favoritesModal) {
        favoritesModal.addEventListener('click', function(e) {
            if (e.target === favoritesModal) {
                closeFavoritesModalFunc();
            }
        });
    }

    // お気に入りモーダルを表示する関数
    function showFavoritesModal() {
        const favoritedRoomIds = window.favoritesManager.getAll();
        const userNumber = localStorage.getItem('netcity_userNumber');
        const displayNumber = `No.${userNumber}`;

        console.log('お気に入りルームID:', favoritedRoomIds);

        // お気に入りリストをクリア
        favoritesList.innerHTML = '';

        // roomsCacheから全ルームを取得
        const roomsCache = window.getRoomsCache ? window.getRoomsCache() : {};
        const favoriteRooms = [];

        // 全カテゴリのルームからお気に入りと自分のルームを探す
        Object.values(roomsCache).forEach(room => {
            const isOwn = room.creatorNumber === displayNumber;
            const isFavorited = favoritedRoomIds.includes(room.id);

            if (isOwn || isFavorited) {
                favoriteRooms.push({
                    id: room.id,
                    name: room.name,
                    category: room.category,
                    currentUsers: room.currentUsers || 0,
                    maxUsers: room.maxUsers || 30,
                    emoji: room.emoji || '🏠'
                });
            }
        });

        console.log('お気に入りルーム数:', favoriteRooms.length);

        // お気に入りルームを表示
        if (favoriteRooms.length === 0) {
            favoritesList.innerHTML = '<div class="favorites-empty">お気に入りはまだありません<br><i class="fa-solid fa-star"></i>ボタンでルームを保存できます</div>';
        } else {
            favoriteRooms.forEach(room => {
                const categoryIcon = {
                    'main': '<i class="fa-solid fa-house"></i>',
                    'news': '<i class="fa-solid fa-newspaper"></i>',
                    'night': '<i class="fa-solid fa-moon"></i>',
                    'consultation': '<i class="fa-solid fa-comments"></i>',
                    'hobby': '<i class="fa-solid fa-palette"></i>'
                };

                const categoryName = {
                    'main': 'メイン',
                    'news': 'ニュース',
                    'night': '夜',
                    'consultation': '相談',
                    'hobby': '趣味'
                };

                const item = document.createElement('div');
                item.className = 'favorite-room-item';
                item.innerHTML = `
                    <div class="favorite-room-main">
                        <div class="favorite-room-name">${room.name}</div>
                        <div class="favorite-room-category">${categoryIcon[room.category] || ''} ${categoryName[room.category] || room.category}</div>
                    </div>
                    <div class="favorite-room-users">${room.currentUsers}/${room.maxUsers}</div>
                `;

                // クリックでルームに入室
                item.addEventListener('click', async function() {
                    console.log('お気に入りルームをクリック:', room.id);

                    // city.jsのshowChatViewとjoinRoom関数を使ってルームに入室
                    if (window.showChatView && window.joinRoom) {
                        window.showChatView(room.id, room.name, room.emoji);
                        await window.joinRoom(room.id);
                    }

                    // モーダルを閉じる
                    favoritesModal.classList.remove('active');
                });

                favoritesList.appendChild(item);
            });
        }

        // モーダルを表示
        favoritesModal.classList.add('active');
    }


    // ルームカードが追加されたときにお気に入りボタンを追加
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('room-card')) {
                    addFavoriteButton(node);
                }
            });
        });
    });

    const roomCardsContainer = document.getElementById('roomCardsContainer');
    if (roomCardsContainer) {
        observer.observe(roomCardsContainer, { childList: true });

        // 既存のルームカードにもボタンを追加
        document.querySelectorAll('.room-card').forEach(card => {
            addFavoriteButton(card);
        });
    }

    // お気に入りボタンを追加する関数
    function addFavoriteButton(card) {
        // 既にボタンがある場合はスキップ
        if (card.querySelector('.favorite-btn')) return;

        const roomId = card.dataset.roomId;
        const roomCardSide = card.querySelector('.room-card-side');

        if (roomCardSide) {
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = window.favoritesManager.isFavorited(roomId)
                ? '<i class="fa-solid fa-star"></i>'
                : '<i class="fa-regular fa-star"></i>';
            favoriteBtn.title = 'お気に入り';

            if (window.favoritesManager.isFavorited(roomId)) {
                favoriteBtn.classList.add('favorited');
            }

            // クリックイベント（イベント伝播を止める）
            favoriteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // カードのクリックイベントを発火させない

                const isFavorited = window.favoritesManager.toggle(roomId);

                if (isFavorited) {
                    favoriteBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
                    favoriteBtn.classList.add('favorited');
                } else {
                    favoriteBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
                    favoriteBtn.classList.remove('favorited');
                }
            });

            // ユーザー数の前に挿入
            const usersDiv = roomCardSide.querySelector('.room-card-users');
            if (usersDiv) {
                roomCardSide.insertBefore(favoriteBtn, usersDiv);
            } else {
                roomCardSide.appendChild(favoriteBtn);
            }
        }
    }

    // 初期表示は通常のカテゴリフィルタリング（メインカテゴリ）
    console.log('初期表示: メインカテゴリを表示');
})(); // 即座に実行
