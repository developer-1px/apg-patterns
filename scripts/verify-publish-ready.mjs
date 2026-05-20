import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const failures = []
const maxPackedBytes = 600_000
const maxUnpackedBytes = 4_000_000
const maxDeclarationBytes = 750_000

if (packageJson.private === true) failures.push('package must not be private')
if (!packageJson.name) failures.push('package name is required')
if (!packageJson.description) failures.push('package description is required')
if (!packageJson.license) failures.push('package license is required')
if (!packageJson.version || packageJson.version === '0.0.0') failures.push('package version must be publishable, not 0.0.0')
if (!/^npm@\d+\.\d+\.\d+$/.test(packageJson.packageManager ?? '')) failures.push('packageManager must pin the npm version')
if (typeof packageJson.engines?.node !== 'string') failures.push('engines.node is required')
if (packageJson.name?.startsWith('@') && packageJson.publishConfig?.access !== 'public') {
  failures.push('scoped package must set publishConfig.access to public')
}
if (!existsSync('README.md')) failures.push('README.md is required')
if (!existsSync('CHANGELOG.md')) failures.push('CHANGELOG.md is required')
if (!existsSync('LICENSE')) failures.push('LICENSE is required')
assertDependencyNames('dependencies', packageJson.dependencies, ['zod'])
assertDependencyNames('peerDependencies', packageJson.peerDependencies, ['react'])
assertDependencyNames('optionalDependencies', packageJson.optionalDependencies, [])
assertDependencyNames('bundledDependencies', packageJson.bundledDependencies, [])
if (packageJson.peerDependencies?.react && packageJson.peerDependenciesMeta?.react?.optional !== true) {
  failures.push('react peer dependency must be optional because the root and ./core entries are React-free')
}

for (const subpath of ['.', './core', './react']) {
  assertExportConditions(subpath, packageJson.exports?.[subpath])
}
if (packageJson.exports?.['./package.json'] !== './package.json') {
  failures.push('exports["./package.json"] must expose package metadata')
}

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
const requiredPackedPaths = [
  'package.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.js.map',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/core.js',
  'dist/core.js.map',
  'dist/core.cjs',
  'dist/core.cjs.map',
  'dist/core.d.ts',
  'dist/core.d.cts',
  'dist/react.js',
  'dist/react.js.map',
  'dist/react.cjs',
  'dist/react.cjs.map',
  'dist/react.d.ts',
  'dist/react.d.cts',
]

for (const requiredPath of requiredPackedPaths) {
  if (!packedPaths.has(requiredPath)) failures.push(`packed tarball missing ${requiredPath}`)
}

if (pack.size > maxPackedBytes) failures.push(`packed tarball size ${pack.size} exceeds ${maxPackedBytes} bytes`)
if (pack.unpackedSize > maxUnpackedBytes) failures.push(`unpacked package size ${pack.unpackedSize} exceeds ${maxUnpackedBytes} bytes`)

for (const sideEffectPath of packageJson.sideEffects ?? []) {
  if (typeof sideEffectPath !== 'string') continue
  const packedPath = sideEffectPath.replace(/^\.\//, '')
  if (!packedPaths.has(packedPath)) failures.push(`sideEffects references unpacked path ${sideEffectPath}`)
}

for (const [label, packagePath] of manifestRuntimePaths(packageJson)) {
  const packedPath = packagePath.replace(/^\.\//, '')
  if (!packedPaths.has(packedPath)) failures.push(`${label} references unpacked path ${packagePath}`)
}

for (const file of pack.files) {
  if (!isAllowedPackedPath(file.path)) failures.push(`packed tarball includes unexpected path ${file.path}`)
  if (/^(src|demo|scripts|docs|coverage)\//.test(file.path)) failures.push(`packed tarball includes non-runtime path ${file.path}`)
  if (/\.test\.[cm]?[jt]sx?$/.test(file.path)) failures.push(`packed tarball includes test file ${file.path}`)
  if (/^dist\/.*\.(?:js|cjs)$/.test(file.path)) assertRuntimeSourceMapReference(file.path, packedPaths)
  if (/^dist\/.*\.map$/.test(file.path)) assertPortableSourceMap(file.path)
  if (/^dist\/(?:index|core|react)\.d\.(ts|cts)$/.test(file.path) && file.size > maxDeclarationBytes) {
    failures.push(`${file.path} size ${file.size} exceeds ${maxDeclarationBytes} bytes`)
  }
}

for (const entry of reactFreeEntries()) {
  for (const runtimePath of runtimeClosure(entry.esm)) {
    if (hasReactModuleImport(readFileSync(runtimePath, 'utf8'))) {
      failures.push(`React-free ${entry.label} ESM output imports react: ${relativePath(runtimePath)}`)
    }
  }

  for (const runtimePath of runtimeClosure(entry.cjs)) {
    if (hasReactModuleImport(readFileSync(runtimePath, 'utf8'))) {
      failures.push(`React-free ${entry.label} CJS output imports react: ${relativePath(runtimePath)}`)
    }
  }

  for (const declarationPath of entry.declarations) {
    if (hasReactModuleImport(readFileSync(declarationPath, 'utf8'))) {
      failures.push(`React-free ${entry.label} declarations import react: ${declarationPath}`)
    }
  }
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

function assertDependencyNames(section, dependencies, expectedNames) {
  const names = dependencies
    ? Array.isArray(dependencies)
      ? dependencies
      : Object.keys(dependencies)
    : []
  const expected = new Set(expectedNames)
  for (const name of names) {
    if (!expected.has(name)) failures.push(`${section}.${name} is not part of the publish dependency surface`)
  }
  for (const name of expected) {
    if (!names.includes(name)) failures.push(`${section}.${name} is required`)
  }
}

function reactFreeEntries() {
  return [
    {
      label: 'root',
      esm: 'dist/index.js',
      cjs: 'dist/index.cjs',
      declarations: ['dist/index.d.ts', 'dist/index.d.cts'],
    },
    {
      label: 'core',
      esm: 'dist/core.js',
      cjs: 'dist/core.cjs',
      declarations: ['dist/core.d.ts', 'dist/core.d.cts'],
    },
  ]
}

function assertExportConditions(subpath, entry) {
  if (!entry || typeof entry !== 'object') {
    failures.push(`exports["${subpath}"] is required`)
    return
  }
  for (const condition of ['types', 'import', 'require']) {
    if (typeof entry[condition] !== 'string') failures.push(`exports["${subpath}"].${condition} must be a package path`)
  }
}

function readPackManifest() {
  const stdout = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  const result = JSON.parse(stdout)
  if (!Array.isArray(result) || !result[0]?.files) throw new Error('npm pack --dry-run did not return file metadata')
  return result[0]
}

function isAllowedPackedPath(path) {
  return requiredPackedPaths.includes(path) || /^dist\/chunk-[A-Z0-9]+\.(?:js|cjs)(?:\.map)?$/.test(path)
}

function assertRuntimeSourceMapReference(runtimePath, packedPaths) {
  const source = readFileSync(runtimePath, 'utf8')
  const expectedMapPath = `${runtimePath}.map`
  const expectedSpecifier = expectedMapPath.replace(/^dist\//, '')
  const matches = [...source.matchAll(/\/\/# sourceMappingURL=([^\r\n]+)/g)].map((match) => match[1].trim())
  if (matches.length !== 1) {
    failures.push(`${runtimePath} must contain exactly one sourceMappingURL comment`)
    return
  }
  if (matches[0] !== expectedSpecifier) failures.push(`${runtimePath} sourceMappingURL must be ${expectedSpecifier}`)
  if (!packedPaths.has(expectedMapPath)) failures.push(`${runtimePath} sourceMappingURL references unpacked path ${expectedMapPath}`)
}

function assertPortableSourceMap(mapPath) {
  const source = readFileSync(mapPath, 'utf8')
  const localPaths = [process.cwd(), process.env.HOME].filter(Boolean)
  for (const localPath of localPaths) {
    if (source.includes(localPath)) failures.push(`${mapPath} contains local filesystem path ${localPath}`)
  }

  let map
  try {
    map = JSON.parse(source)
  } catch {
    failures.push(`${mapPath} must be valid JSON`)
    return
  }

  if (map.version !== 3) failures.push(`${mapPath} must be a v3 source map`)
  for (const sourcePath of map.sources ?? []) {
    if (/^(?:\/|[A-Za-z]:[\\/]|file:|https?:)/.test(sourcePath)) {
      failures.push(`${mapPath} contains non-portable source path ${sourcePath}`)
    }
  }
}

function manifestRuntimePaths(pkg) {
  const paths = []
  for (const field of ['main', 'module', 'types']) {
    if (typeof pkg[field] === 'string') paths.push([field, pkg[field]])
  }
  collectExportPaths(pkg.exports, 'exports', paths)
  return paths
}

function collectExportPaths(value, label, paths) {
  if (typeof value === 'string') {
    paths.push([label, value])
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    collectExportPaths(child, `${label}.${key}`, paths)
  }
}

function runtimeClosure(entryPath) {
  const out = []
  const seen = new Set()
  visitRuntimePath(resolve(entryPath), out, seen)
  return out
}

function visitRuntimePath(path, out, seen) {
  if (seen.has(path)) return
  seen.add(path)
  out.push(path)
  const source = readFileSync(path, 'utf8')
  for (const specifier of runtimeImportSpecifiers(source)) {
    if (!specifier.startsWith('.')) continue
    visitRuntimePath(resolve(dirname(path), specifier), out, seen)
  }
}

function runtimeImportSpecifiers(source) {
  const specifiers = []
  const importPattern = /\b(?:import|export)\b(?:[^'"]*\bfrom\s*)?['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  for (const match of source.matchAll(importPattern)) {
    specifiers.push(match[1] ?? match[2] ?? match[3])
  }
  return specifiers
}

function hasReactModuleImport(source) {
  return /\b(?:import|export)\b(?:[^'"]*\bfrom\s*)?['"]react['"]|\brequire\s*\(\s*['"]react['"]\s*\)|\bimport\s*\(\s*['"]react['"]\s*\)/.test(source)
}

function relativePath(path) {
  return path.replace(`${process.cwd()}/`, '')
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
