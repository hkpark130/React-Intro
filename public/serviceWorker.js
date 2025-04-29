// 캐시 이름 설정
const CACHE_NAME = 'portfolio-cache-v1';

// 캐싱할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/vite.svg'
];

// 서비스 워커 설치 및 캐싱
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('캐시 설치 중 오류:', error);
      })
  );
  // 새로운 서비스 워커를 즉시 활성화
  self.skipWaiting();
});

// 캐시 사용 및 네트워크 요청
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾으면 캐시된 응답 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없으면 네트워크 요청
        return fetch(event.request)
          .then(response => {
            // 응답이 유효하지 않으면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 중요한 응답을 캐싱 (이미지, 스타일, 스크립트 등)
            const responseToCache = response.clone();
            if (event.request.url.match(/\.(js|css|png|jpeg|jpg|svg|ico)$/)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          });
      })
  );
});

// 이전 캐시 정리
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
  
  // 활성화 후 클라이언트 제어 확보
  self.clients.claim();
});