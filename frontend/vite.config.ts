import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // 127.0.0.1 고정: 로컬·Codespaces 모두 동작 (localhost는 Node가 IPv6 ::1로 해석해 프록시 실패할 수 있음)
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // Codespaces 포워딩 도메인 Origin 헤더로 인한 백엔드 CORS 403 방지:
        // 프록시가 백엔드로 넘길 때 Origin을 제거해 same-origin처럼 처리되게 함(개발 전용)
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
          });
        },
      },
    },
  },
})
