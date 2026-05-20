import { readFile, readdir } from 'node:fs/promises'

const repoRoot = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'))
const sideEffects = packageJson.sideEffects

if (!Array.isArray(sideEffects)) {
  throw new Error('package sideEffects must be an array')
}

const sideEffectPatterns = sideEffects.map((pattern) => ({
  pattern,
  regex: globToRegex(pattern),
}))

const sourceFiles = await listFiles(new URL('src/', repoRoot), 'src')
const registrationFiles = []
const patternDefinitionFiles = []

for (const filePath of sourceFiles) {
  if (!filePath.endsWith('.ts')) continue
  const source = await readFile(new URL(filePath, repoRoot), 'utf8')
  if (isRegistrationSource(source)) registrationFiles.push(filePath)
  if (/^src\/patterns\/[^/]+\/definition\.ts$/.test(filePath)) patternDefinitionFiles.push(filePath)
}

const expectedSourceFiles = [...new Set([...registrationFiles, ...patternDefinitionFiles])].sort((a, b) => a.localeCompare(b))
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
  if (!matchesSideEffect(packagePath)) missing.push(packagePath)
}

for (const pattern of unexpected) {
  missing.push(`${pattern} (sideEffects must reference bundled dist entries only)`)
}

if (missing.length > 0) {
  throw new Error(`package sideEffects does not match bundled output:\n${missing.join('\n')}`)
}

console.log(`package sideEffects cover ${expectedSourceFiles.length} bundled side-effectful source files via ${expectedDistFiles.length} dist entries`)

async function listFiles(rootUrl, prefix) {
  const entries = await readdir(rootUrl, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = `${prefix}/${entry.name}`
    if (entry.isDirectory()) {
      files.push(...await listFiles(new URL(`${entry.name}/`, rootUrl), entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function isRegistrationSource(source) {
  return /(?:^|\n)\s*define(?:AriaSource|NavigationTarget|Predicate|StateProjection)\s*\(/.test(source)
}

function matchesSideEffect(packagePath) {
  return sideEffectPatterns.some(({ regex }) => regex.test(packagePath))
}

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')
  return new RegExp(`^${escaped}$`)
}
