import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

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

for (const sourceImport of productionIndexImports()) {
  failures.push(`production source imports the public barrel: ${sourceImport}`)
}

const pack = readPackManifest()
const packedPaths = new Set(pack.files.map((file) => file.path))
const allowedPackedPaths = new Set([
  'package.json',
  'README.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.ts',
  'dist/index.d.cts',
])

for (const requiredPath of ['package.json', 'README.md', 'LICENSE', 'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts']) {
  if (!packedPaths.has(requiredPath)) failures.push(`packed tarball missing ${requiredPath}`)
}

for (const sideEffectPath of packageJson.sideEffects ?? []) {
  if (typeof sideEffectPath !== 'string') continue
  const packedPath = sideEffectPath.replace(/^\.\//, '')
  if (!packedPaths.has(packedPath)) failures.push(`sideEffects references unpacked path ${sideEffectPath}`)
}

for (const file of pack.files) {
  if (!allowedPackedPaths.has(file.path)) failures.push(`packed tarball includes unexpected path ${file.path}`)
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

function productionIndexImports() {
  const sourceRoot = resolve('src')
  const publicIndex = resolve(sourceRoot, 'index.ts')
  const failures = []

  for (const file of sourceFiles(sourceRoot)) {
    if (resolve(file) === publicIndex) continue
    const source = readFileSync(file, 'utf8')
    for (const specifier of relativeImportSpecifiers(source)) {
      if (resolvesToSourceIndex(file, specifier, publicIndex)) {
        failures.push(`${file}:${specifier}`)
      }
    }
  }

  return failures
}

function sourceFiles(directory) {
  const out = []
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry)
    const testsRoot = resolve('src/tests')
    if (path === testsRoot || path.startsWith(`${testsRoot}/`)) continue
    const stat = statSync(path)
    if (stat.isDirectory()) {
      out.push(...sourceFiles(path))
      continue
    }
    if (/\.(test|d)\.[cm]?[tj]sx?$/.test(path)) continue
    if (/\.[cm]?tsx?$/.test(path)) out.push(path)
  }
  return out
}

function relativeImportSpecifiers(source) {
  const specifiers = []
  const importPattern = /\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]|\bimport\s+['"](\.{1,2}\/[^'"]+)['"]|\bimport\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)|\brequire\s*\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g
  for (const match of source.matchAll(importPattern)) {
    specifiers.push(match[1] ?? match[2] ?? match[3] ?? match[4])
  }
  return specifiers
}

function resolvesToSourceIndex(file, specifier, publicIndex) {
  const base = resolve(dirname(file), specifier)
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, 'index.ts'),
    resolve(base, 'index.tsx'),
  ].some((candidate) => candidate === publicIndex)
}
