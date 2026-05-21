import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

const forbiddenTokens = [
  ['legacy kernel package import', '@interactive-os/' + 'aria-kernel'],
  ['legacy pattern facade import', '@interactive-os/' + 'apg-patterns-legacy'],
  ['sibling legacy workspace path', '../aria-' + 'kernel'],
  ['legacy workspace path', 'aria-' + 'kernel/'],
  ['legacy pattern facade path', 'legacy/' + 'apg-patterns'],
  ['old in-workspace pattern facade path', 'packages/' + 'apg-patterns'],
]

const dependencyFields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
  'devDependencies',
  'bundleDependencies',
  'bundledDependencies',
]

const textExtensions = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

const failures = []
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

if (packageJson.name !== '@interactive-os/aria') {
  failures.push(`package.json name must stay @interactive-os/aria; found ${JSON.stringify(packageJson.name)}`)
}

for (const field of dependencyFields) {
  const value = packageJson[field]
  if (!value) continue

  if (Array.isArray(value)) {
    for (const dependencyName of value) {
      checkText(`package.json ${field}`, dependencyName)
    }
    continue
  }

  for (const [dependencyName, dependencySpec] of Object.entries(value)) {
    checkText(`package.json ${field} name`, dependencyName)
    checkText(`package.json ${field}.${dependencyName}`, String(dependencySpec))
  }
}

const scannedFiles = []
for (const path of gitFiles(['ls-files'])) {
  if (!shouldScanFile(path)) continue
  scannedFiles.push(path)
  checkText(path, readFileSync(path, 'utf8'))
}

if (failures.length > 0) {
  console.error(`Package independence check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Package independence check scanned ${scannedFiles.length} tracked files and found no legacy package coupling.`)

function checkText(label, text) {
  for (const [reason, token] of forbiddenTokens) {
    if (text.includes(token)) {
      failures.push(`${label} contains ${reason}: ${token}`)
    }
  }
}

function shouldScanFile(path) {
  if (path === 'scripts/verify-package-independence.mjs') return false
  if (path.startsWith('coverage/') || path.startsWith('demo/dist/') || path.startsWith('dist/')) return false
  if (path.startsWith('node_modules/')) return false
  return textExtensions.has(extname(path))
}

function gitFiles(args) {
  const stdout = execFileSync('git', [...args, '-z'], { encoding: 'utf8' })
  return stdout.split('\0').filter(Boolean).sort((left, right) => left.localeCompare(right))
}
