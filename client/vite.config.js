// vite.config.js
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
    host: 'localhost',
    port: 5173,
    allowedHosts: ['a814-5-14-132-204.ngrok-free.app'],
    hmr: {
      overlay: false, // dezactiveaza erorile de tip overlay (care pot bloca UI-ul)
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})