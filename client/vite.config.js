import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FRONTEND PROXY SETUP TO BACKEND
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})