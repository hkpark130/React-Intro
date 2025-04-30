self.addEventListener('install', (event) => {
  console.log('Service Worker installed.');
  self.skipWaiting(); // 설치되자마자 활성화
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
});

self.addEventListener('fetch', (event) => {
  // 오프라인 캐시 안 함
  return;
});