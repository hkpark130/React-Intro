import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 서비스 워커 등록 함수
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('서비스 워커 등록 성공:', registration.scope);
        })
        .catch(error => {
          console.error('서비스 워커 등록 실패:', error);
        });
    });
  }
};

// 서비스 워커 등록
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)