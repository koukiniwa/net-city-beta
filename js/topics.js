/**
 * NET CITY β - 話題データベース
 * チャットルームで使用する話題のデータベース
 */

const topicsDatabase = {
    // メインカテゴリ
    main: {
        light: [
            '最近観た映画やドラマで面白かったものは？',
            '好きな食べ物や飲み物を教えて！',
            '休日はどう過ごすことが多い？',
            '最近買ってよかったものは？',
            '子供の頃の思い出で印象的なことは？',
            '好きな音楽やアーティストは？',
            '行ってみたい場所はどこ？',
            'ペットを飼うなら何を飼いたい？',
            '朝型？夜型？',
            '得意料理や好きな料理は？',
            '最近ハマっていることは？',
            '学生時代に熱中したことは？',
            '好きな季節とその理由は？',
            '理想の休日の過ごし方は？'
        ],
        deep: [
            '人生で一番影響を受けた出来事は？',
            '今一番やりたいことは何？',
            '10年後の自分はどうなっていたい？',
            '大切にしている価値観は？',
            '人生のターニングポイントはいつ？',
            '忘れられない言葉はある？',
            '今の自分に満足してる？',
            '変えたい習慣はある？'
        ]
    },

    // 相談カテゴリ
    consultation: [
        '最近悩んでいることはある？',
        '仕事や学校で困っていることは？',
        '人間関係で気になることはある？',
        'アドバイスが欲しいことは？',
        '決断に迷っていることはある？',
        '誰かに聞いてほしいことは？',
        'ストレス解消法を教えて！',
        '最近うまくいったことは？',
        '成功体験を共有しよう！'
    ],

    // 夜カテゴリ
    night: [
        '今日一日どうだった？',
        '眠れない夜はどう過ごす？',
        '夜に聴きたい音楽は？',
        '深夜に食べたくなるものは？',
        '明日の予定は？',
        '今日あった良いことは？',
        '夜更かしする理由は？',
        '夜に考えてしまうことは？',
        '深夜のテンションで後悔したことは？',
        '理想の夜の過ごし方は？'
    ],

    // ニュースカテゴリ（時事）
    news: [
        '最近気になったニュースは？',
        '今の社会で変わってほしいことは？',
        '未来はどうなっていると思う？',
        '今年の重大ニュースは何だと思う？',
        '技術の進歩で期待していることは？'
    ],

    // 趣味カテゴリ
    hobby: [
        '最近始めた趣味は？',
        'おすすめの本や漫画は？',
        'ハマっているゲームはある？',
        '休日にやってみたいことは？',
        'スポーツは何が好き？',
        '特技や得意なことは？',
        'コレクションしているものは？',
        '最近の趣味での成果は？',
        '新しく始めたい趣味は？',
        '趣味仲間を募集したい趣味は？'
    ],

    // 季節の話題
    seasonal: {
        spring: [
            '桜は見に行った？おすすめのスポットは？',
            'お花見の予定は？',
            '春といえば何を思い浮かべる？',
            '新生活で始めたことは？',
            '春の好きな食べ物は？'
        ],
        summer: [
            '今年の夏の予定は？',
            '海派？山派？プール派？',
            '暑さ対策は何してる？',
            '夏の思い出で印象的なことは？',
            'かき氷の好きな味は？'
        ],
        autumn: [
            '紅葉は見に行く？',
            '秋の味覚で好きなものは？',
            '読書の秋、何読んでる？',
            'スポーツの秋、何してる？',
            'ハロウィンの予定は？'
        ],
        winter: [
            '冬の過ごし方は？',
            'クリスマスの予定は？',
            '年末年始は何する？',
            '雪は好き？',
            '冬の好きな食べ物は？',
            '今年の目標は達成できた？',
            '来年の目標は？'
        ]
    },

    // 時間帯別の話題
    timeOfDay: {
        morning: [
            '今日の予定は？',
            '朝ごはんは何食べた？',
            '朝は得意？苦手？',
            '今日の目標は？',
            '朝のルーティンは？'
        ],
        afternoon: [
            'お昼は何食べた？',
            '午後はどう過ごす？',
            '眠くない？',
            'ランチのおすすめは？',
            '今日の調子はどう？'
        ],
        evening: [
            '今日はどんな日だった？',
            '夕飯は何食べる？',
            '今日の良かったことは？',
            'これから何する？',
            '疲れてない？'
        ],
        night: [
            '今日お疲れ様！',
            '明日は何する？',
            '夜ふかしする？',
            '寝る前に何してる？',
            '最近の睡眠時間は？',
            '今日一番印象的だったことは？'
        ]
    }
};

/**
 * カテゴリと時間帯に応じた話題を3つランダムに取得
 * @param {string} category - ルームのカテゴリ (chat, love, news, etc.)
 * @returns {Array<string>} 話題の配列（3つ）
 */
function getRandomTopics(category) {
    // 現在の季節を判定
    const month = new Date().getMonth() + 1; // 1-12
    let season;
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';

    // 現在の時間帯を判定
    const hour = new Date().getHours();
    let timeOfDay;
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // カテゴリに応じた話題を取得
    let categoryTopics = [];
    if (category === 'main') {
        // メインは軽め8割、深め2割
        const lightTopics = topicsDatabase.main.light;
        const deepTopics = topicsDatabase.main.deep;
        categoryTopics = [...lightTopics, ...lightTopics, ...deepTopics]; // 軽め多め
    } else {
        categoryTopics = topicsDatabase[category] || topicsDatabase.main.light;
    }

    // 季節の話題を追加
    const seasonalTopics = topicsDatabase.seasonal[season] || [];

    // 時間帯の話題を追加
    const timeTopics = topicsDatabase.timeOfDay[timeOfDay] || [];

    // すべての話題を統合
    const allTopics = [...categoryTopics, ...seasonalTopics, ...timeTopics];

    // ランダムに3つ選択（重複なし）
    const shuffled = allTopics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

/**
 * ニュース要約を取得（時事カテゴリ用）
 * @returns {Promise<Array<string>>} ニュース見出しの配列
 */
async function getNewsTopics() {
    try {
        // Google News RSS を使用（無料）
        const RSS_URL = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';

        // RSSをフェッチ（CORS対策でプロキシ使用）
        // 複数のプロキシを試す
        const PROXY_URLS = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];

        let response = null;
        let text = null;

        // プロキシを順番に試す
        for (const PROXY_URL of PROXY_URLS) {
            try {
                console.log(`📡 プロキシ試行: ${PROXY_URL}`);

                // タイムアウト設定（5秒）
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                response = await fetch(PROXY_URL + encodeURIComponent(RSS_URL), {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    text = await response.text();
                    console.log(`✅ プロキシ成功: ${PROXY_URL}`);
                    break;
                }
            } catch (proxyError) {
                console.warn(`⚠️ プロキシ失敗: ${PROXY_URL}`, proxyError);
                continue;
            }
        }

        if (!text) {
            throw new Error('全てのプロキシで失敗しました');
        }

        // XMLをパース
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        // パースエラーをチェック
        const parseError = xml.querySelector('parsererror');
        if (parseError) {
            console.error('XMLパースエラー:', parseError.textContent);
            throw new Error('XMLのパースに失敗しました');
        }

        // ニュースアイテムを取得
        const items = xml.querySelectorAll('item');
        console.log(`📰 取得したニュース数: ${items.length}`);

        const news = [];

        // 上位5件のニュースを取得
        for (let i = 0; i < Math.min(5, items.length); i++) {
            const title = items[i].querySelector('title')?.textContent;
            if (title) {
                // CDATAセクションやHTMLタグを除去
                const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, '').trim();
                if (cleanTitle) {
                    news.push(`📰 ${cleanTitle}`);
                }
            }
        }

        if (news.length > 0) {
            console.log(`✅ ニュース取得成功: ${news.length}件`);
            return news;
        } else {
            console.warn('⚠️ ニュースが見つかりませんでした');
            return topicsDatabase.news;
        }

    } catch (error) {
        console.error('❌ ニュース取得エラー:', error);
        // エラー時はデフォルトの話題を返す
        return topicsDatabase.news;
    }
}

// グローバルに公開
window.topicsDatabase = topicsDatabase;
window.getRandomTopics = getRandomTopics;
window.getNewsTopics = getNewsTopics;
