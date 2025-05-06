import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: 'localhost',  // sau '0.0.0.0' dacă ai nevoie de acces din WSL/Docker/alt dispozitiv
    port: 5173,
    hmr: {
      protocol: 'ws',       // 'ws' pentru HTTP, 'wss' pentru HTTPS
      host: 'localhost',    // sau IP‑ul tău local/LAN
      port: 5173,
      // path: '/hmr'       // doar dacă ai customizat calea
    }
  }
})
