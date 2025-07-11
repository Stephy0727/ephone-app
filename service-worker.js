// 定义缓存名称和版本
const CACHE_NAME = 'ephone-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // 这里添加其他需要缓存的核心资源
  'https://files.catbox.moe/q6z5fc.jpeg',
  'https://unpkg.com/dexie/dist/dexie.js'
];

// 安装阶段 - 缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('已打开缓存');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求 - 使用缓存或网络
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，则返回缓存
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request).then(
          response => {
            // 检查是否收到有效响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应流（只能使用一次）
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});