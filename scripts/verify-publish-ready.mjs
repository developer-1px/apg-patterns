import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []

if (packageJson.private === true) failures.push('package must not be private')
if (!packageJson.name) failures.push('package name is required')
if (!packageJson.description) failures.push('package description is required')
if (!packageJson.license) failures.push('package license is required')
if (!packageJson.version || packageJson.version === '0.0.0') failures.push('package version must be publishable, not 0.0.0')
if (!existsSync('README.md')) failures.push('README.md is required')
if (!existsSync('LICENSE')) failures.push('LICENSE is required')

for (const [section, dependencies] of Object.entries(dependencySections(packageJson))) {
  for (const [name, spec] of Object.entries(dependencies)) {
    if (typeof spec !== 'string') continue
    if (/^(file|link|workspace):/.test(spec)) failures.push(`${section}.${name} uses local-only spec ${spec}`)
  }
}

const pack = readPackManifest()
const packedPaths = new Set(pack.files.map((file) => file.path))

for (const requiredPath of ['package.json', 'README.md', 'LICENSE', 'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts']) {
  if (!packedPaths.has(requiredPath)) failures.push(`packed tarball missing ${requiredPath}`)
}

for (const file of pack.files) {
  if (/^(src|demo|scripts|docs|coverage)\//.test(file.path)) failures.push(`packed tarball includes non-runtime path ${file.path}`)
  if (/\.test\.[cm]?[jt]sx?$/.test(file.path)) failures.push(`packed tarball includes test file ${file.path}`)
}

if (failures.length > 0) {
  console.error(`Publish readiness check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Publish readiness covers ${pack.files.length} packed files.`)

function dependencySections(pkg) {
  return {
    dependencies: pkg.dependencies ?? {},
    peerDependencies: pkg.peerDependencies ?? {},
    optionalDependencies: pkg.optionalDependencies ?? {},
    bundledDependencies: pkg.bundledDependencies ?? {},
  }
}

function readPackManifest() {
  const stdout = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  const result = JSON.parse(stdout)
  if (!Array.isArray(result) || !result[0]?.files) throw new Error('npm pack --dry-run did not return file metadata')
  return result[0]
}
