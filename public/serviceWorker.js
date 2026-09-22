self.addEventListener('install', () => {
  console.log('Service Worker installed.');
  self.skipWaiting(); // 설치되자마자 활성화
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated.');
});

self.addEventListener('fetch', () => {
  // 오프라인 캐시 안 함
  return;
});
