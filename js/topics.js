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
            '理想の休日の過ごし方は？',
            '最近笑ったことは？',
            'マイブームは何？',
            '癒されるものは何？',
            '好きな色とその理由は？',
            '朝ごはんは何派？',
            'コーヒー派？紅茶派？',
            '甘いもの好き？辛いもの好き？',
            '温泉派？海派？山派？',
            '犬派？猫派？',
            '読書は好き？',
            '最近の小さな幸せは？',
            '週末の楽しみは？',
            '好きなYouTubeチャンネルは？',
            'インスタとTwitterどっち見る？',
            '最近感動したことは？',
            'ストレス解消法は？'
        ],
        deep: [
            '人生で一番影響を受けた出来事は？',
            '今一番やりたいことは何？',
            '10年後の自分はどうなっていたい？',
            '大切にしている価値観は？',
            '人生のターニングポイントはいつ？',
            '忘れられない言葉はある？',
            '今の自分に満足してる？',
            '変えたい習慣はある？',
            '人生で後悔していることは？',
            '自分の強みと弱みは？',
            '幸せってなんだと思う？',
            '大切な人に伝えたいことは？',
            '生きがいは何？',
            '夢を諦めたことはある？',
            '自分らしさってなんだと思う？'
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
        '成功体験を共有しよう！',
        'モチベーションを上げる方法は？',
        '時間の使い方で悩んでいることは？',
        '人に言えない悩みはある？',
        '自分を変えたいと思うことは？',
        'コミュニケーションで困ることは？',
        '将来の不安について話そう',
        '健康面で気をつけていることは？',
        'メンタルケアで効果的だったことは？',
        '失敗から学んだことは？',
        'ポジティブになれる方法は？',
        '誰かを励ましたいことはある？'
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
        '理想の夜の過ごし方は？',
        '今日の疲れはどう？',
        '寝る前のルーティンは？',
        '夢はよく見る？',
        '明日が楽しみなことは？',
        '今日頑張ったことは？',
        '夜の静けさは好き？',
        '深夜ラジオ聴く？',
        '夜景は好き？',
        '月や星は見る？',
        '夜型生活のメリット・デメリットは？',
        '今日の反省点は？',
        '明日こそやりたいことは？',
        '夜に飲みたいものは？',
        'リラックス方法は？',
        '今の気分を一言で表すと？'
    ],

    // ニュースカテゴリ（時事）
    news: [
        '最近気になったニュースは？',
        '今の社会で変わってほしいことは？',
        '未来はどうなっていると思う？',
        '今年の重大ニュースは何だと思う？',
        '技術の進歩で期待していることは？',
        'AIの発展をどう思う？',
        '環境問題で気になることは？',
        '最近の経済ニュースで気になることは？',
        '政治について思うことは？',
        '国際情勢で注目していることは？',
        '科学技術のニュースで驚いたことは？',
        'SNSの影響をどう感じる？',
        '働き方の変化をどう思う？',
        '教育制度について思うことは？',
        '医療やヘルスケアの進歩で期待することは？',
        '交通や移動手段の未来はどうなる？',
        'エンターテインメントの変化をどう感じる？',
        'スポーツニュースで気になることは？',
        '地域のニュースで話題になっていることは？',
        '世代間の価値観の違いを感じることは？'
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
        '趣味仲間を募集したい趣味は？',
        '最近観たアニメやドラマのおすすめは？',
        '音楽は何を聴いてる？',
        '写真や動画撮影は好き？',
        'DIYや手作りで作ったものは？',
        '料理のレパートリーでおすすめは？',
        'アウトドア派？インドア派？',
        'アートや美術館は好き？',
        '楽器は何か演奏できる？',
        '旅行で行きたい場所は？',
        'オンラインで楽しんでいることは？',
        'ペットや動物は好き？',
        '推し活してる？',
        '最近買った趣味グッズは？',
        '一人で楽しむ趣味と人と楽しむ趣味どっち？',
        'クリエイティブな活動してる？'
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
        // キャッシュをチェック（30分間有効）
        const cached = checkNewsCache();
        if (cached) {
            console.log('✅ キャッシュからニュース取得');
            return cached;
        }

        // 複数のニュースソース
        const NEWS_SOURCES = [
            {
                name: 'Google News',
                url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja'
            },
            {
                name: 'Yahoo News',
                url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml'
            }
        ];

        // より多くのプロキシ（高速化と成功率向上）
        const PROXY_URLS = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://thingproxy.freeboard.io/fetch/'
        ];

        let news = [];

        // ニュースソースを順番に試す
        for (const source of NEWS_SOURCES) {
            try {
                console.log(`📡 ニュースソース試行: ${source.name}`);

                // 複数のプロキシを並列で試す（最も速いものを採用）
                const fetchPromises = PROXY_URLS.map(async (proxyUrl) => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒に短縮

                    try {
                        const response = await fetch(proxyUrl + encodeURIComponent(source.url), {
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);

                        if (response.ok) {
                            return await response.text();
                        }
                        throw new Error('Response not OK');
                    } catch (error) {
                        clearTimeout(timeoutId);
                        throw error;
                    }
                });

                // 最初に成功したプロキシの結果を使用
                const text = await Promise.race(fetchPromises.map(p =>
                    p.catch(() => Promise.reject())
                )).catch(() => null);

                if (!text) {
                    console.warn(`⚠️ ${source.name}の取得に失敗`);
                    continue;
                }

                console.log(`✅ ${source.name}から取得成功`);

                // XMLをパース
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'text/xml');

                // パースエラーをチェック
                const parseError = xml.querySelector('parsererror');
                if (parseError) {
                    console.warn(`⚠️ ${source.name}のパースに失敗`);
                    continue;
                }

                // ニュースアイテムを取得
                const items = xml.querySelectorAll('item');
                console.log(`📰 ${source.name}: ${items.length}件のニュース`);

                // 上位10件のニュースを取得（多様性向上）
                for (let i = 0; i < Math.min(10, items.length); i++) {
                    const title = items[i].querySelector('title')?.textContent;
                    const link = items[i].querySelector('link')?.textContent;

                    if (title && link) {
                        // CDATAセクションやHTMLタグを除去
                        const cleanTitle = title.replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, '').trim();
                        const cleanLink = link.replace(/<!\[CDATA\[|\]\]>|<[^>]+>/g, '').trim();

                        if (cleanTitle && cleanTitle.length > 5 && cleanLink) {
                            const newsItem = {
                                title: `📰 ${cleanTitle}`,
                                url: cleanLink
                            };
                            news.push(newsItem);
                            console.log('📰 ニュースアイテム:', newsItem);
                        }
                    }
                }

                // 十分なニュースが取得できたら終了
                if (news.length >= 5) {
                    break;
                }

            } catch (error) {
                console.warn(`⚠️ ${source.name}エラー:`, error.message);
                continue;
            }
        }

        // ニュースが取得できた場合
        if (news.length > 0) {
            // ランダムにシャッフルして多様性を確保
            const shuffled = news.sort(() => Math.random() - 0.5);
            const result = shuffled.slice(0, 5);

            // キャッシュに保存（30分間有効）
            saveNewsCache(result);

            console.log(`✅ ニュース取得成功: ${result.length}件`);
            return result;
        } else {
            console.warn('⚠️ ニュースが見つかりませんでした');
            // プリセット話題をオブジェクト形式で返す（URLなし）
            return topicsDatabase.news.map(topic => ({ title: topic, url: null }));
        }

    } catch (error) {
        console.error('❌ ニュース取得エラー:', error);
        // エラー時はデフォルトの話題を返す（URLなし）
        return topicsDatabase.news.map(topic => ({ title: topic, url: null }));
    }
}

/**
 * ニュースキャッシュをチェック
 * @returns {Array<string>|null} キャッシュされたニュース、または null
 */
function checkNewsCache() {
    try {
        const cached = localStorage.getItem('netcity_news_cache');
        if (!cached) return null;

        const data = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - data.timestamp;
        const CACHE_DURATION = 30 * 60 * 1000; // 30分

        if (cacheAge < CACHE_DURATION) {
            console.log(`📦 キャッシュ有効（残り${Math.floor((CACHE_DURATION - cacheAge) / 60000)}分）`);
            return data.news;
        } else {
            console.log('📦 キャッシュ期限切れ');
            localStorage.removeItem('netcity_news_cache');
            return null;
        }
    } catch (error) {
        console.warn('⚠️ キャッシュ読み込みエラー:', error);
        return null;
    }
}

/**
 * ニュースをキャッシュに保存
 * @param {Array<string>} news - ニュース配列
 */
function saveNewsCache(news) {
    try {
        const data = {
            news: news,
            timestamp: Date.now()
        };
        localStorage.setItem('netcity_news_cache', JSON.stringify(data));
        console.log('📦 ニュースをキャッシュに保存');
    } catch (error) {
        console.warn('⚠️ キャッシュ保存エラー:', error);
    }
}

/**
 * Gemini APIを使って話題を生成する関数
 * @param {string} category - ルームのカテゴリ
 * @returns {Promise<Array>} 話題の配列（3つ）
 */
async function generateTopicsWithGemini(category) {
    try {
        // キャッシュをチェック（30分間有効）
        const cacheKey = `netcity_gemini_topics_${category}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            const cacheAge = Date.now() - data.timestamp;
            const CACHE_DURATION = 30 * 60 * 1000; // 30分

            if (cacheAge < CACHE_DURATION) {
                console.log(`📦 キャッシュから話題を取得 (残り${Math.floor((CACHE_DURATION - cacheAge) / 60000)}分)`);
                return data.topics;
            }
        }

        const GEMINI_API_KEY = 'AIzaSyBMcZPQilay80mplp5iXJOfKzJFg2m83xY';

        // カテゴリごとのプロンプト
        const prompts = {
            main: '日本語で、気軽な雑談に使える話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。番号付きリストで回答してください。例：\n1. 最近ハマっていることは？',
            hobby: '日本語で、趣味やエンターテイメントに関する話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。番号付きリストで回答してください。',
            consultation: '日本語で、相談しやすい話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。番号付きリストで回答してください。',
            night: '日本語で、深夜の雑談に適した話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。番号付きリストで回答してください。',
            news: '日本語で、ニュースや時事問題、最近の出来事について話すきっかけになる話題を3つ提案してください。短く簡潔に、疑問形で終わるようにしてください。番号付きリストで回答してください。例：\n1. 最近気になったニュースは？'
        };

        const prompt = prompts[category] || prompts.main;

        console.log(`🤖 Gemini APIで話題を生成中... (カテゴリ: ${category})`);

        // Gemini APIを呼び出し
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 500,
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const generatedText = data.candidates[0].content.parts[0].text;

        console.log('✅ Gemini応答:', generatedText);

        // テキスト形式の話題をパース（1行ずつ）
        const lines = generatedText.split('\n').filter(line => line.trim());
        const topics = lines
            .filter(line => line.match(/^[0-9１-９\-\*\•]/) || line.includes('？'))
            .map(line => line.replace(/^[0-9１-９\-\*\•\.\)）\s]+/, '').trim())
            .filter(topic => topic.length > 0)
            .slice(0, 3);

        console.log('✅ 生成された話題:', topics);

        const result = topics.map(topic => ({ title: topic, url: null }));

        // キャッシュに保存
        localStorage.setItem(cacheKey, JSON.stringify({
            topics: result,
            timestamp: Date.now()
        }));

        return result;

    } catch (error) {
        console.error('❌ Gemini API エラー:', error);
        // フォールバック: プリセット話題を使用
        const fallbackTopics = getRandomTopics(category);
        return fallbackTopics.map(topic => ({ title: topic, url: null }));
    }
}

// グローバルに公開
window.topicsDatabase = topicsDatabase;
window.getRandomTopics = getRandomTopics;
window.getNewsTopics = getNewsTopics;
window.generateTopicsWithGemini = generateTopicsWithGemini;
