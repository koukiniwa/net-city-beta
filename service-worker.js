// ========================================
// NET CITY β - Service Worker
// オフライン対応とキャッシュ管理
// ========================================

const CACHE_NAME = 'net-city-v2';
const urlsToCache = [
  './',
  './index.html',
  './city.html',
  './css/index.css',
  './css/city.css',
  './js/index.js',
  './js/city.js'
];

// ========================================
// インストール時: ファイルをキャッシュ
// ========================================
self.addEventListener('install', (event) => {
  console.log('[Service Worker] インストール中...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] すべてのファイルをキャッシュしました');
        return self.skipWaiting(); // すぐに有効化
      })
  );
});

// ========================================
// アクティベート時: 古いキャッシュを削除
// ========================================
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] アクティベート中...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // すぐに制御開始
    })
  );
});

// ========================================
// フェッチ時: キャッシュ優先で取得
// ========================================
self.addEventListener('fetch', (event) => {
  // サポートされていないスキーム（chrome-extension など）は無視
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Firebase へのリクエストはキャッシュしない
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return; // Firebaseは常にネットワークから取得
  }

  // バージョンパラメータ付きのリクエスト（?v=XXX）は常にネットワークから取得
  if (event.request.url.includes('?v=')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          console.log('[Service Worker] キャッシュから取得:', event.request.url);
          return response;
        }

        // なければネットワークから取得
        console.log('[Service Worker] ネットワークから取得:', event.request.url);
        return fetch(event.request).then((response) => {
          // レスポンスが有効でないならそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
  );
});

// ========================================
// メッセージ受信（将来の拡張用）
// ========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
