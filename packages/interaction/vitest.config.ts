import { defineConfig } from 'vitest/config'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root,
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 15000,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
