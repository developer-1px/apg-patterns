// Auto-collected source files for the source viewer.
// Uses Vite's import.meta.glob to gather raw text contents of:
//   - Top-level src files (src/*.ts — e.g. index.ts)
//   - Layered kernel files (src/schema/*.ts, src/kernel/*.ts, src/adapters/*.ts)
//   - All pattern definition/runtime files (src/patterns/<name>/*.ts)
//   - All demo files in demo/src (*.tsx, *Data.ts, plus a few helpers)

const rootModules = import.meta.glob('../../../src/*.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const layerModules = import.meta.glob([
  '../../../src/schema/*.ts',
  '../../../src/kernel/*.ts',
  '../../../src/adapters/*.ts',
], { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const patternModules = import.meta.glob('../../../src/patterns/*/*.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const demoTsxModules = import.meta.glob([
  '../patterns/*/*.tsx',
  '../app/*.tsx',
  '../shared/*.tsx',
], { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const demoDataModules = import.meta.glob([
  '../patterns/*/*.ts',
  '../app/*.ts',
  '../shared/*.ts',
  '../shared/inspect/*.ts',
  './*.ts',
], { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const collected: Record<string, string> = {}

// src root: keep filename only (e.g. index.ts)
for (const [path, src] of Object.entries(rootModules)) {
  const name = path.split('/').pop()!
  collected[name] = src
}
// schema/kernel/adapters: keep <folder>/<file>.ts to preserve concept map
for (const [path, src] of Object.entries(layerModules)) {
  const parts = path.split('/')
  const file = parts.pop()!
  const dir = parts.pop()!
  collected[`${dir}/${file}`] = src
}
// patterns: keep <patternName>/<file>.ts
for (const [path, src] of Object.entries(patternModules)) {
  const parts = path.split('/')
  const file = parts.pop()!
  const dir = parts.pop()!
  collected[`${dir}/${file}`] = src
}
// demo *.tsx
for (const [path, src] of Object.entries(demoTsxModules)) {
  const name = path.split('/').pop()!
  if (name.endsWith('.test.tsx')) continue
  collected[name] = src
}
// demo *.ts (data files and helpers)
for (const [path, src] of Object.entries(demoDataModules)) {
  const name = path.split('/').pop()!
  if (name.endsWith('.test.ts')) continue
  collected[name] = src
}

export const sources: Readonly<Record<string, string>> = collected
export type SourceName = string
