/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function localOrigin(value, name) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be a loopback HTTP origin`); }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
      || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be a loopback HTTP origin`);
  }
  return url.origin;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, projectRoot, ''), ...process.env };
  const editorial = mode === 'editorial';
  if (editorial && env.VITE_API_URL) localOrigin(env.VITE_API_URL, 'VITE_API_URL');
  const target = editorial
    ? localOrigin(env.EDITORIAL_API_TARGET || 'http://127.0.0.1:8100', 'EDITORIAL_API_TARGET')
    : env.VITE_API_URL;
  const chatTarget = localOrigin(env.RAG_API_TARGET || 'http://127.0.0.1:8000', 'RAG_API_TARGET');
  return {
  plugins: [react()],
  ...(editorial ? { define: { 'import.meta.env.VITE_API_URL': JSON.stringify('') } } : {}),
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, 'src'), // @/를 src 폴더로 매핑
    },
  },
  server: {
    ...(editorial ? { host: '127.0.0.1' } : {}),
    proxy: editorial ? {
      '/api/chat': { target: chatTarget, changeOrigin: false, followRedirects: false },
      '/api': { target, changeOrigin: false, followRedirects: false },
    } : {
      '/api/chat': { target: chatTarget, changeOrigin: false, followRedirects: false },
      '/api': target, // Spring API (기존)
      '/notion': 'http://localhost:3000', // SSR Notion 서비스 (로컬 개발 시)
      '/seo': 'http://localhost:3000' // OGP Preview API 프록시
    }
  }
  };
})
