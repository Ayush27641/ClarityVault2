import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    hmr: {
      port: 5174,
      host: 'localhost'
    },
    cors: true
  }
})
