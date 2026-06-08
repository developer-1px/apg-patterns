import { readFile } from 'node:fs/promises'

const repoRoot = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'))
const sideEffects = packageJson.sideEffects

if (!Array.isArray(sideEffects)) {
  throw new Error('package sideEffects must be an array')
}

const expectedDistFiles = [
  './dist/index.js',
  './dist/index.cjs',
  './dist/core.js',
  './dist/core.cjs',
  './dist/react.js',
  './dist/react.cjs',
]
const missing = []
const unexpected = sideEffects.filter((pattern) => !expectedDistFiles.includes(pattern))

for (const packagePath of expectedDistFiles) {
  if (!sideEffects.includes(packagePath)) missing.push(packagePath)
}

for (const pattern of unexpected) {
  missing.push(`${pattern} (sideEffects must reference bundled dist entries only)`)
}

if (missing.length > 0) {
  throw new Error(`package sideEffects does not match bundled output:\n${missing.join('\n')}`)
}

console.log(`package sideEffects cover ${expectedDistFiles.length} bundled dist entries`)
