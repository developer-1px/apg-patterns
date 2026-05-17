import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'demo',
  base: './',
  appType: 'mpa',
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
  resolve: {
    alias: {
      '@interactive-os/devtools/rec': resolve(__dirname, '../devtools/src/rec/index.ts'),
    },
  },
})
