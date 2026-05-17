import { defineConfig } from 'vite'

export default defineConfig({
  root: 'demo',
  base: './',
  cacheDir: '../node_modules/.vite-demo',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
    fs: {
      allow: ['..'],
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
})
