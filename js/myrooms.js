// ========================================
// NET CITY β - マイルーム機能
// ========================================

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ マイルーム機能を初期化');

    // 下部ナビゲーションのタブ切り替え
    const navItems = document.querySelectorAll('.nav-item');
    const roomListView = document.getElementById('roomListView');

    let currentTab = 'home'; // 現在のタブ

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const tab = this.dataset.tab;
            console.log('タブクリック:', tab);

            // 作成ボタンは別処理（既存のモーダルを開く）
            if (tab === 'create') {
                return; // createRoomBtnの既存のイベントハンドラに任せる
            }

            // イベントの伝播を止める
            e.preventDefault();
            e.stopPropagation();

            // アクティブ状態を切り替え
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');

            currentTab = tab;

            // 表示を更新
            updateRoomDisplay(tab);
        });
    });

    // ルーム表示を更新する関数
    function updateRoomDisplay(tab) {
        const roomCardsContainer = document.getElementById('roomCardsContainer');
        if (!roomCardsContainer) return;

        const allRoomCards = roomCardsContainer.querySelectorAll('.room-card');
        const userNumber = localStorage.getItem('netcity_userNumber');
        const displayNumber = `No.${userNumber}`; // No.7形式に変換

        if (tab === 'home') {
            console.log('ホームタブ: 全ルームを表示');
            // 全てのルームを表示
            allRoomCards.forEach(card => {
                card.style.display = '';
            });

            // ウェルカムメッセージを非表示
            const welcomeMsg = roomCardsContainer.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'none';
            }
        } else if (tab === 'myrooms') {
            console.log('マイルームタブ: 自分のルームのみ表示');
            console.log('自分の番号:', displayNumber);

            // 自分のルームを取得
            const myRooms = [];
            allRoomCards.forEach(card => {
                const creatorNumber = card.dataset.creator;
                console.log('ルームの作成者:', creatorNumber);
                const isOwn = creatorNumber === displayNumber; // No.7形式で比較

                if (isOwn) {
                    myRooms.push(card);
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });

            console.log('自分のルーム数:', myRooms.length);

            // ルームが1つだけの場合は自動入室
            if (myRooms.length === 1) {
                console.log('自動入室: ルームが1つだけなので直接入室します');
                const roomCard = myRooms[0];

                // クリックイベントを発火（既存の入室処理を使う）
                roomCard.click();

                // ホームタブに戻す（次回のために）
                setTimeout(() => {
                    const homeTab = document.querySelector('.nav-item[data-tab="home"]');
                    if (homeTab) {
                        navItems.forEach(n => n.classList.remove('active'));
                        homeTab.classList.add('active');
                    }
                }, 100);
            } else if (myRooms.length === 0) {
                // ルームがない場合
                const welcomeMsg = roomCardsContainer.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.style.display = 'block';
                    welcomeMsg.innerHTML = '<p>作成したルームはありません</p><p>➕ボタンからルームを作成できます</p>';
                }
            } else {
                // ルームが2つある場合は選択画面を表示
                console.log('選択画面: ルームが2つあるので選択できます');
                const welcomeMsg = roomCardsContainer.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.style.display = 'none';
                }
            }
        }
    }
});
