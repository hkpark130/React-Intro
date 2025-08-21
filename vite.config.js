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
      '/api': process.env.VITE_API_URL, // Spring API (기존)
      '/notion': 'http://localhost:3000' // SSR Notion 서비스 (로컬 개발 시)
    }
  }
})
