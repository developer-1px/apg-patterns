import { globSync } from 'node:fs'
import { defineConfig } from 'tsup'

const entries = globSync('src/**/*.ts', { cwd: import.meta.dirname }).filter(
  (path) => !path.endsWith('.test.ts') && !path.endsWith('.d.ts'),
)

export default defineConfig({
  entry: entries,
  format: ['esm', 'cjs'],
  dts: { resolve: true, compilerOptions: { composite: false } },
  tsconfig: './tsconfig.json',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: true,
  treeshake: true,
  external: ['zod'],
})
