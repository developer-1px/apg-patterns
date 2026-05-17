// Auto-collected source files for the source viewer.
// Uses Vite's import.meta.glob to gather raw text contents of:
//   - Top-level src files (src/*.ts — e.g. index.ts)
//   - Layered kernel files (src/schema/*.ts, src/kernel/*.ts, src/adapters/*.ts)
//   - All pattern definition/runtime files (src/patterns/<name>/*.ts)
//   - All demo files in demo/src (*.tsx, *Data.ts, plus a few helpers)

type SourceLoader = () => Promise<string>
type SourceCollision = {
  name: string
  paths: readonly string[]
}

const rootModules = import.meta.glob('../../../src/*.ts', { query: '?raw', import: 'default' }) as Record<string, SourceLoader>
const layerModules = import.meta.glob([
  '../../../src/schema/*.ts',
  '../../../src/kernel/*.ts',
  '../../../src/adapters/*.ts',
], { query: '?raw', import: 'default' }) as Record<string, SourceLoader>
const patternModules = import.meta.glob('../../../src/patterns/*/*.ts', { query: '?raw', import: 'default' }) as Record<string, SourceLoader>
const demoTsxModules = import.meta.glob([
  '../patterns/*/*.tsx',
  '../app/*.tsx',
  '../shared/*.tsx',
  '!../patterns/**/*.test.tsx',
  '!../patterns/**/*.apg.test.tsx',
  '!../app/**/*.test.tsx',
  '!../shared/**/*.test.tsx',
], { query: '?raw', import: 'default' }) as Record<string, SourceLoader>
const demoDataModules = import.meta.glob([
  '../patterns/*/*.ts',
  '../app/*.ts',
  '../shared/*.ts',
  '../shared/inspect/*.ts',
  './*.ts',
  '!../patterns/**/*.test.ts',
  '!../patterns/**/*.apg.test.ts',
  '!../app/**/*.test.ts',
  '!../shared/**/*.test.ts',
], { query: '?raw', import: 'default' }) as Record<string, SourceLoader>

const collected: Record<string, SourceLoader> = {}
const collectedPaths = new Map<string, string[]>()

function registerSource(name: string, path: string, load: SourceLoader) {
  collected[name] = load
  collectedPaths.set(name, [...(collectedPaths.get(name) ?? []), path])
}

// src root: keep filename only (e.g. index.ts)
for (const [path, load] of Object.entries(rootModules)) {
  const name = path.split('/').pop()!
  registerSource(name, path, load)
}
// schema/kernel/adapters: keep <folder>/<file>.ts to preserve concept map
for (const [path, load] of Object.entries(layerModules)) {
  const parts = path.split('/')
  const file = parts.pop()!
  const dir = parts.pop()!
  registerSource(`${dir}/${file}`, path, load)
}
// patterns: keep <patternName>/<file>.ts
for (const [path, load] of Object.entries(patternModules)) {
  const parts = path.split('/')
  const file = parts.pop()!
  const dir = parts.pop()!
  registerSource(`${dir}/${file}`, path, load)
}
// demo *.tsx
for (const [path, load] of Object.entries(demoTsxModules)) {
  const name = path.split('/').pop()!
  if (name.endsWith('.test.tsx')) continue
  registerSource(name, path, load)
}
// demo *.ts (data files and helpers)
for (const [path, load] of Object.entries(demoDataModules)) {
  const name = path.split('/').pop()!
  if (name.endsWith('.test.ts')) continue
  registerSource(name, path, load)
}

export const sourceLoaders: Readonly<Record<string, SourceLoader>> = collected
export const sourceNameCollisions: readonly SourceCollision[] = Array.from(collectedPaths.entries())
  .filter(([, paths]) => paths.length > 1)
  .map(([name, paths]) => ({ name, paths }))
export type SourceName = string
