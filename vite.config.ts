import { createRequire } from 'node:module'

import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)

export default defineConfig({
  root: 'demo',
  base: './',
  appType: 'mpa',
  cacheDir: '../node_modules/.vite-demo',
  resolve: {
    alias: [
      { find: /^react$/, replacement: require.resolve('react') },
      { find: /^react\/jsx-runtime$/, replacement: require.resolve('react/jsx-runtime') },
      { find: /^react\/jsx-dev-runtime$/, replacement: require.resolve('react/jsx-dev-runtime') },
      { find: /^react-dom$/, replacement: require.resolve('react-dom') },
      { find: /^react-dom\/client$/, replacement: require.resolve('react-dom/client') },
    ],
    dedupe: ['react', 'react-dom'],
  },
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
