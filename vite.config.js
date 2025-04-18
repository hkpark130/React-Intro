import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // @/를 src 폴더로 매핑
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8100' // 백엔드 서버 지정하기
    }
  }
})
