import { access, readFile } from 'node:fs/promises'

const repoRoot = new URL('../', import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'))
const checkedPaths = new Set()
const missing = []

for (const field of ['main', 'module', 'types']) {
  await assertPackagePathExists(`${field}`, packageJson[field])
}

await visitExports(packageJson.exports, 'exports')

for (const entry of packageJson.files ?? []) {
  await assertPackagePathExists('files[]', entry)
}

if (missing.length > 0) {
  throw new Error(`package manifest references missing files:\n${missing.join('\n')}`)
}

console.log(`package manifest references ${checkedPaths.size} existing files or directories`)

async function visitExports(value, label) {
  if (typeof value === 'string') {
    await assertPackagePathExists(label, value)
    return
  }
  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    await visitExports(child, `${label}.${key}`)
  }
}

async function pathExists(packagePath) {
  if (typeof packagePath !== 'string' || packagePath.length === 0) return false
  const normalized = packagePath.replace(/^\.\//, '')
  try {
    await access(new URL(normalized, repoRoot))
    return true
  } catch {
    return false
  }
}

async function assertPackagePathExists(label, packagePath) {
  if (typeof packagePath !== 'string') {
    missing.push(`${label}: expected package path string`)
    return
  }

  const exists = await pathExists(packagePath)
  if (!exists) {
    missing.push(`${label}: ${packagePath}`)
    return
  }
  checkedPaths.add(packagePath)
}
