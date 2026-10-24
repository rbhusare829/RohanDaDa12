import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** The backend (Express). In development Vite forwards the API, the uploaded files, the sitemap and robots.txt to it. */
const backend = process.env.BACKEND_URL ?? 'http://localhost:3001'
const proxy = Object.fromEntries(['/api', '/uploads', '/sitemap.xml', '/robots.txt'].map((p) => [p, { target: backend, changeOrigin: false }]))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  server: { port: 3000, strictPort: true, proxy },
  preview: { port: 3000, strictPort: true, proxy },
  build: { sourcemap: false, chunkSizeWarningLimit: 700 },
})
