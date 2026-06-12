import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 127.0.0.1 고정: 로컬·Codespaces 모두 동작 (localhost는 Node가 IPv6 ::1로 해석해 프록시 실패할 수 있음)
      '/api': 'http://127.0.0.1:8080',
    },
  },
})
