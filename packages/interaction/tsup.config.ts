import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    runtime: 'src/runtime.ts',
    definition: 'src/definition.ts',
    react: 'src/react/index.tsx',
  },
  format: ['esm', 'cjs'],
  dts: { compilerOptions: { composite: false } },
  tsconfig: './tsconfig.json',
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: true,
  treeshake: true,
  external: ['react', 'zod'],
})
