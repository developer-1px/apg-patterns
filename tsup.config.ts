import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts', 'src/react.ts'],
  format: ['esm', 'cjs'],
  dts: { compilerOptions: { composite: false } },
  tsconfig: './tsconfig.json',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: true,
  treeshake: true,
  external: ['zod', 'react'],
})
