import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
const tempRoot = mkdtempSync(join(tmpdir(), 'apg-patterns-consumer-'))

try {
  const tarballPath = packCurrentPackage(tempRoot)
  runConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-root'),
    includeReact: false,
    smokeKind: 'root',
  })
  runConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-react'),
    includeReact: true,
    smokeKind: 'react',
  })
  runConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-core'),
    includeReact: false,
    smokeKind: 'core',
  })
  runNpmInstalledConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-npm-install-root'),
    includeReact: false,
    smokeKind: 'root',
  })
  runNpmInstalledConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-npm-install-core'),
    includeReact: false,
    smokeKind: 'core',
  })
  runNpmInstalledConsumerSmoke({
    tarballPath,
    consumerRoot: join(tempRoot, 'consumer-npm-install-react'),
    includeReact: true,
    smokeKind: 'react',
  })

  console.log('package consumer smoke passed for actual npm pack tarball integrity, ESM, CJS, runtime export parity, warning-free script-enabled npm tarball install with package-lock integrity, transitive runtime dependencies and optional React, Vite bundler builds for root/core/react, NodeNext/Bundler/CJS TypeScript, package metadata and published docs, package export encapsulation, React-free root/core imports, root/core React API boundaries, and React TSX subpath imports.')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}

function runConsumerSmoke({ tarballPath, consumerRoot, includeReact, smokeKind }) {
  const nodeModules = join(consumerRoot, 'node_modules')
  const packageRoot = join(nodeModules, '@interactive-os', 'apg-patterns')

  mkdirSync(join(nodeModules, '@interactive-os'), { recursive: true })
  execFileSync('tar', ['-xzf', tarballPath, '-C', join(nodeModules, '@interactive-os')], { cwd: repoRoot })
  renameSync(join(nodeModules, '@interactive-os', 'package'), packageRoot)

  linkPackageDependency(nodeModules, 'zod')
  if (includeReact) {
    mkdirSync(join(nodeModules, '@types'), { recursive: true })
    linkPackageDependency(nodeModules, 'react')
    linkPackageDependency(nodeModules, '@types/react')
    linkPackageDependency(nodeModules, 'csstype')
  }

  writeConsumerFiles(consumerRoot, smokeKind)
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.bundler.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.cjs-nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
}

function runNpmInstalledConsumerSmoke({ tarballPath, consumerRoot, includeReact, smokeKind }) {
  mkdirSync(consumerRoot, { recursive: true })
  const dependencies = {
    '@interactive-os/apg-patterns': localFileSpec(tarballPath),
  }
  const devDependencies = {}
  const overrides = {
    zod: localFileSpec(join(repoRoot, 'node_modules', 'zod')),
  }

  if (includeReact) {
    dependencies.react = localFileSpec(join(repoRoot, 'node_modules', 'react'))
    dependencies['react-dom'] = localFileSpec(join(repoRoot, 'node_modules', 'react-dom'))
    devDependencies['@types/react'] = localFileSpec(join(repoRoot, 'node_modules', '@types/react'))
    devDependencies['@types/react-dom'] = localFileSpec(join(repoRoot, 'node_modules', '@types/react-dom'))
    devDependencies.csstype = localFileSpec(join(repoRoot, 'node_modules', 'csstype'))
  }

  writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies,
    devDependencies,
    overrides,
  }, null, 2))

  runNpmInstall(consumerRoot)
  assertNpmInstallLockfile(consumerRoot, tarballPath, includeReact)
  assertRuntimeDependencyInstallState(consumerRoot)
  assertReactInstallState(consumerRoot, includeReact)

  writeConsumerFiles(consumerRoot, smokeKind, { writePackageJson: false })
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.bundler.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.cjs-nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  runViteBundlerSmoke(consumerRoot, smokeKind)
}

function packCurrentPackage(destination) {
  const stdout = execFileSync('npm', ['pack', '--pack-destination', destination, '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const result = JSON.parse(stdout)
  const pack = result[0]
  const filename = pack?.filename
  if (!filename) throw new Error('npm pack did not return a tarball filename')
  if (!Array.isArray(pack.files)) throw new Error('npm pack did not return packed file metadata')
  const tarballPath = join(destination, filename)
  if (!existsSync(tarballPath)) throw new Error(`npm pack did not create ${tarballPath}`)
  assertPackedTarballArtifact(tarballPath, pack)
  return tarballPath
}

function assertPackedTarballArtifact(tarballPath, pack) {
  const tarball = readFileSync(tarballPath)
  if (statSync(tarballPath).size !== pack.size || tarball.length !== pack.size) {
    throw new Error(`npm pack tarball size did not match manifest size for ${pack.filename}`)
  }

  const shasum = createHash('sha1').update(tarball).digest('hex')
  if (shasum !== pack.shasum) throw new Error(`npm pack tarball sha1 did not match manifest shasum for ${pack.filename}`)

  const integrity = `sha512-${createHash('sha512').update(tarball).digest('base64')}`
  if (integrity !== pack.integrity) {
    throw new Error(`npm pack tarball sha512 did not match manifest integrity for ${pack.filename}`)
  }

  const expectedPaths = pack.files.map((file) => file.path).sort((left, right) => left.localeCompare(right))
  const tarEntries = execFileSync('tar', ['-tzf', tarballPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean)
  const invalidEntries = tarEntries.filter((entry) => !entry.startsWith('package/') || entry === 'package/')
  if (invalidEntries.length > 0) {
    throw new Error(`npm pack tarball contains invalid entries:\n${invalidEntries.join('\n')}`)
  }

  const actualPaths = tarEntries
    .map((entry) => entry.slice('package/'.length))
    .sort((left, right) => left.localeCompare(right))
  if (actualPaths.join('\n') !== expectedPaths.join('\n')) {
    throw new Error(`npm pack tarball entries did not match manifest files for ${pack.filename}`)
  }
}

function linkPackageDependency(nodeModules, name) {
  const source = join(repoRoot, 'node_modules', name)
  if (!existsSync(source)) throw new Error(`Missing local dependency for package smoke: ${source}`)
  const target = join(nodeModules, name)
  mkdirSync(dirname(target), { recursive: true })
  symlinkSync(source, target, 'dir')
}

function localFileSpec(path) {
  if (!existsSync(path)) throw new Error(`Missing local package dependency for package smoke: ${path}`)
  return `file:${path}`
}

function runNpmInstall(consumerRoot) {
  const result = spawnSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=warn'], {
    cwd: consumerRoot,
    encoding: 'utf8',
  })
  const output = [result.stdout, result.stderr].filter(Boolean).join('\n')

  if (result.status !== 0) {
    throw new Error(`npm install failed in package consumer smoke:\n${output}`)
  }
  if (/\bnpm\s+warn\b/i.test(output)) {
    throw new Error(`npm install emitted warnings in package consumer smoke:\n${output}`)
  }
}

function assertNpmInstallLockfile(consumerRoot, tarballPath, includeReact) {
  const lockPath = join(consumerRoot, 'package-lock.json')
  if (!existsSync(lockPath)) throw new Error('npm install did not create a package-lock.json')

  const packageLock = JSON.parse(readFileSync(lockPath, 'utf8'))
  if (packageLock.lockfileVersion !== 3) throw new Error('npm consumer package-lock must use lockfileVersion 3')

  const rootPackage = packageLock.packages?.['']
  if (!rootPackage) throw new Error('npm consumer package-lock is missing root package metadata')
  if (rootPackage.dependencies?.['@interactive-os/apg-patterns'] !== localFileSpec(tarballPath)) {
    throw new Error('npm consumer package-lock did not retain the tarball dependency spec')
  }

  const installedPackage = packageLock.packages?.['node_modules/@interactive-os/apg-patterns']
  if (!installedPackage) throw new Error('npm consumer package-lock is missing the installed package entry')
  if (installedPackage.version !== packageJson.version) throw new Error('npm consumer package-lock recorded the wrong package version')
  if (installedPackage.license !== packageJson.license) throw new Error('npm consumer package-lock recorded the wrong package license')
  if (installedPackage.engines?.node !== packageJson.engines?.node) {
    throw new Error('npm consumer package-lock recorded the wrong Node engine')
  }
  if (installedPackage.dependencies?.zod !== packageJson.dependencies?.zod) {
    throw new Error('npm consumer package-lock recorded the wrong zod runtime dependency')
  }
  if (installedPackage.peerDependencies?.react !== packageJson.peerDependencies?.react) {
    throw new Error('npm consumer package-lock recorded the wrong React peer dependency')
  }
  if (installedPackage.peerDependenciesMeta?.react?.optional !== true) {
    throw new Error('npm consumer package-lock did not record React as an optional peer')
  }
  if (typeof installedPackage.resolved !== 'string' || !installedPackage.resolved.startsWith('file:') || !installedPackage.resolved.endsWith(basename(tarballPath))) {
    throw new Error('npm consumer package-lock did not resolve the package to the packed tarball')
  }

  const expectedIntegrity = `sha512-${createHash('sha512').update(readFileSync(tarballPath)).digest('base64')}`
  if (installedPackage.integrity !== expectedIntegrity) {
    throw new Error('npm consumer package-lock recorded the wrong tarball integrity')
  }
  if (!packageLock.packages?.['node_modules/zod']) throw new Error('npm consumer package-lock is missing the zod runtime dependency')
  const hasReactLockEntry = Boolean(packageLock.packages?.['node_modules/react'])
  if (includeReact && !hasReactLockEntry) throw new Error('React npm consumer package-lock is missing react')
  if (!includeReact && hasReactLockEntry) throw new Error('React-free npm consumer package-lock unexpectedly includes react')
}

function assertReactInstallState(consumerRoot, includeReact) {
  const packages = ['react', 'react-dom', '@types/react', '@types/react-dom']
  for (const name of packages) {
    const installed = existsSync(packageInstallPath(consumerRoot, name))
    if (includeReact && !installed) throw new Error(`Expected npm consumer to install ${name}`)
    if (!includeReact && installed) throw new Error(`React-free npm consumer unexpectedly installed ${name}`)
  }
}

function assertRuntimeDependencyInstallState(consumerRoot) {
  const consumerPackageJson = JSON.parse(readFileSync(join(consumerRoot, 'package.json'), 'utf8'))
  if (consumerPackageJson.dependencies?.zod) throw new Error('npm consumer must not install zod as a direct dependency')

  const packageRoot = packageInstallPath(consumerRoot, '@interactive-os/apg-patterns')
  const packageRequire = createRequire(join(packageRoot, 'package.json'))
  const zodPath = packageRequire.resolve('zod')
  if (!existsSync(zodPath)) throw new Error('Installed package could not resolve its zod runtime dependency')
}

function packageInstallPath(consumerRoot, name) {
  return join(consumerRoot, 'node_modules', ...name.split('/'))
}

function writeConsumerFiles(consumerRoot, smokeKind, options = {}) {
  const typeSmokeFilename = smokeKind === 'react' ? 'type-smoke.tsx' : 'type-smoke.ts'
  const cjsTypeSmokeFilename = 'cjs-type-smoke.cts'
  if (options.writePackageJson !== false) {
    writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2))
  }
  writeFileSync(join(consumerRoot, 'esm-smoke.mjs'), runtimeSmokeSource('esm', smokeKind))
  writeFileSync(join(consumerRoot, 'cjs-smoke.cjs'), runtimeSmokeSource('cjs', smokeKind))
  writeFileSync(join(consumerRoot, 'tsconfig.nodenext.json'), tsconfigSource({
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    include: [typeSmokeFilename],
  }))
  writeFileSync(join(consumerRoot, 'tsconfig.bundler.json'), tsconfigSource({
    module: 'ESNext',
    moduleResolution: 'Bundler',
    include: [typeSmokeFilename],
  }))
  writeFileSync(join(consumerRoot, 'tsconfig.cjs-nodenext.json'), tsconfigSource({
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    include: [cjsTypeSmokeFilename],
  }))
  const typeSmoke = smokeKind === 'core' || smokeKind === 'root'
    ? coreTypeSmokeSource(smokeKind === 'core' ? '@interactive-os/apg-patterns/core' : '@interactive-os/apg-patterns')
    : readFileSync(new URL('./fixtures/package-consumer-react-type-smoke.tsx', import.meta.url), 'utf8')
  writeFileSync(join(consumerRoot, typeSmokeFilename), typeSmoke)
  writeFileSync(join(consumerRoot, cjsTypeSmokeFilename), cjsTypeSmokeSource(smokeKind))
}

function runViteBundlerSmoke(consumerRoot, smokeKind) {
  mkdirSync(join(consumerRoot, 'src'), { recursive: true })
  writeFileSync(join(consumerRoot, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.ts"></script></body></html>\n')
  writeFileSync(join(consumerRoot, 'src/main.ts'), viteConsumerSource(smokeKind))
  execFileSync(join(repoRoot, 'node_modules/.bin/vite'), ['build', '--logLevel', 'error'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })
  if (!existsSync(join(consumerRoot, 'dist/index.html'))) {
    throw new Error('Vite consumer build did not create dist/index.html')
  }
}

function viteConsumerSource(smokeKind) {
  if (smokeKind === 'react') {
    return `import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, type PatternData, type PatternEvent } from '@interactive-os/apg-patterns/react'
import { buttonDefinition, createPatternRuntime } from '@interactive-os/apg-patterns/core'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: PatternEvent[] = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

if (runtime.visibleKeys[0] !== 'primary') throw new Error('runtime did not resolve visible keys')

const root = document.getElementById('root')
if (!root) throw new Error('missing root element')

createRoot(root).render(createElement(Button, {
  data,
  onEvent: (event: PatternEvent) => events.push(event),
}))
`
  }

  const packagePath = smokeKind === 'core' ? '@interactive-os/apg-patterns/core' : '@interactive-os/apg-patterns'
  return `import { buttonDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '${packagePath}'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: PatternEvent[] = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

if (runtime.visibleKeys[0] !== 'primary') throw new Error('runtime did not resolve visible keys')

document.body.dataset.visibleKey = runtime.visibleKeys[0] ?? ''
`
}

function tsconfigSource({ module, moduleResolution, include }) {
  return JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module,
      moduleResolution,
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM'],
      skipLibCheck: false,
    },
    include,
  }, null, 2)
}

function runtimeSmokeSource(moduleKind, smokeKind) {
  const packagePath = smokeKind === 'core' ? '@interactive-os/apg-patterns/core' : '@interactive-os/apg-patterns'
  const importLine = moduleKind === 'esm'
    ? `import { buttonDefinition, createPatternRuntime } from '${packagePath}'`
    : `const { buttonDefinition, createPatternRuntime } = require('${packagePath}')`
  const reactSmoke = smokeKind !== 'react'
    ? ''
    : moduleKind === 'esm'
      ? "\nconst { Button } = await import('@interactive-os/apg-patterns/react')\nif (typeof Button !== 'function') throw new Error('react subpath did not expose Button')\n"
      : "\nconst { Button } = require('@interactive-os/apg-patterns/react')\nif (typeof Button !== 'function') throw new Error('react subpath did not expose Button')\n"
  const metadataSmoke = moduleKind === 'cjs' ? packageMetadataSmokeSource() : ''
  const deepImportSmoke = moduleKind === 'esm'
    ? `
await assertPackagePathNotExported(
  () => import('@interactive-os/apg-patterns/dist/core.js'),
  'ESM dist deep import',
)

async function assertPackagePathNotExported(load, label) {
  try {
    await load()
  } catch (error) {
    if (error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') return
    throw new Error(\`\${label} failed with unexpected error \${error?.code ?? error}\`)
  }
  throw new Error(\`\${label} was unexpectedly exported\`)
}
`
    : `
assertPackagePathNotExported(
  () => require('@interactive-os/apg-patterns/dist/core.cjs'),
  'CJS dist deep import',
)

function assertPackagePathNotExported(load, label) {
  try {
    load()
  } catch (error) {
    if (error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') return
    throw new Error(\`\${label} failed with unexpected error \${error?.code ?? error}\`)
  }
  throw new Error(\`\${label} was unexpectedly exported\`)
}
`

  return `${importLine}

const data = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

if (buttonDefinition.apgPattern !== 'button') throw new Error('button definition was not loaded')
if (runtime.visibleKeys[0] !== 'primary') throw new Error('runtime did not resolve visible keys')
if (typeof runtime.getRootKeyboardHandler() !== 'function') throw new Error('runtime keyboard handler missing')
${runtimeExportParitySmokeSource(moduleKind, smokeKind)}
${metadataSmoke}
${reactSmoke}
${deepImportSmoke}
`
}

function runtimeExportParitySmokeSource(moduleKind, smokeKind) {
  const reactImport = smokeKind === 'react'
    ? moduleKind === 'esm'
      ? "const reactApi = await import('@interactive-os/apg-patterns/react')"
      : "const reactApi = require('@interactive-os/apg-patterns/react')"
    : ''
  const reactAssert = smokeKind === 'react'
    ? `
assertExportSuperset(reactApi, coreApi, './react runtime exports', './core runtime exports')
assertNoDefaultExport(reactApi, './react runtime exports')
`
    : ''
  const imports = moduleKind === 'esm'
    ? `const rootApi = await import('@interactive-os/apg-patterns')
const coreApi = await import('@interactive-os/apg-patterns/core')
${reactImport}`
    : `const rootApi = require('@interactive-os/apg-patterns')
const coreApi = require('@interactive-os/apg-patterns/core')
${reactImport}`

  return `
${imports}

assertExactExportSet(rootApi, coreApi, 'root runtime exports', './core runtime exports')
assertNoDefaultExport(rootApi, 'root runtime exports')
assertNoDefaultExport(coreApi, './core runtime exports')
${reactAssert}
function assertExactExportSet(actual, expected, actualLabel, expectedLabel) {
  assertExportSuperset(actual, expected, actualLabel, expectedLabel)
  assertExportSuperset(expected, actual, expectedLabel, actualLabel)
}

function assertExportSuperset(actual, expected, actualLabel, expectedLabel) {
  const actualNames = Object.keys(actual)
  const missing = Object.keys(expected).filter((name) => !actualNames.includes(name)).sort()
  if (missing.length > 0) {
    throw new Error(actualLabel + ' must include every ' + expectedLabel + ': ' + missing.join(', '))
  }
}

function assertNoDefaultExport(api, label) {
  if (Object.prototype.hasOwnProperty.call(api, 'default')) {
    throw new Error(label + ' must not expose a default export')
  }
}
`
}

function packageMetadataSmokeSource() {
  const expectedMetadata = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    keywords: packageJson.keywords,
    license: packageJson.license,
    author: packageJson.author,
    type: packageJson.type,
    packageManager: packageJson.packageManager,
    nodeEngine: packageJson.engines?.node,
    files: packageJson.files,
    main: packageJson.main,
    module: packageJson.module,
    types: packageJson.types,
    private: false,
    reactPeerRange: packageJson.peerDependencies?.react,
    reactPeerOptional: packageJson.peerDependenciesMeta?.react?.optional === true,
    packageJsonExport: packageJson.exports?.['./package.json'],
    publishAccess: packageJson.publishConfig?.access,
  }

  return `
const packageMetadata = require('@interactive-os/apg-patterns/package.json')
const { existsSync, readFileSync } = require('node:fs')
const { dirname, join } = require('node:path')
const expectedMetadata = ${JSON.stringify(expectedMetadata, null, 2)}
const packageRoot = dirname(require.resolve('@interactive-os/apg-patterns/package.json'))

for (const key of ['name', 'version', 'description', 'license', 'author', 'type', 'packageManager', 'main', 'module', 'types']) {
  if (packageMetadata[key] !== expectedMetadata[key]) {
    throw new Error(\`package metadata export did not expose \${key}\`)
  }
}
assertJsonEqual('keywords', packageMetadata.keywords, expectedMetadata.keywords)
assertJsonEqual('files', packageMetadata.files, expectedMetadata.files)
if (packageMetadata.engines?.node !== expectedMetadata.nodeEngine) {
  throw new Error('package metadata export did not expose the expected Node engine')
}
if (packageMetadata.private === true) throw new Error('package metadata export marked the package private')
if (packageMetadata.peerDependencies?.react !== expectedMetadata.reactPeerRange) {
  throw new Error('package metadata export did not expose the expected React peer range')
}
if (packageMetadata.peerDependenciesMeta?.react?.optional !== expectedMetadata.reactPeerOptional) {
  throw new Error('package metadata export did not expose the optional React peer')
}
if (packageMetadata.exports?.['./package.json'] !== expectedMetadata.packageJsonExport) {
  throw new Error('package metadata export did not expose its metadata subpath')
}
if (packageMetadata.publishConfig?.access !== expectedMetadata.publishAccess) {
  throw new Error('package metadata export did not expose public publish access')
}

function assertJsonEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('package metadata export did not expose ' + label)
  }
}

const expectedDocs = {
  'README.md': '# ' + expectedMetadata.name + '\\n',
  'API.md': '# ' + expectedMetadata.name + ' API Reference\\n',
  'CHANGELOG.md': '## ' + expectedMetadata.version,
  'LICENSE': 'MIT License',
  'docs/proposals/2026-05-18-llm-friendly-apg-react-api.md': '# LLM-Friendly APG React API',
  'docs/proposals/2026-05-18-react-facade-zod-blind-loop.md': '# React Facade Zod Descriptor Blind Loop',
}

for (const [filename, marker] of Object.entries(expectedDocs)) {
  const docPath = join(packageRoot, filename)
  if (!existsSync(docPath)) throw new Error('published package is missing ' + filename)
  const source = readFileSync(docPath, 'utf8')
  if (!source.includes(marker)) throw new Error('published ' + filename + ' did not include expected metadata')
}
`
}

function coreTypeSmokeSource(packagePath) {
  return `import {
  buttonDefinition,
  createPatternRuntime,
  type KeyInput,
  type PatternData,
  type PatternEvent,
} from '${packagePath}'

// @ts-expect-error React hooks must stay behind the /react subpath.
import { useButtonPattern } from '${packagePath}'
// @ts-expect-error React preset components must stay behind the /react subpath.
import { Button } from '${packagePath}'

const data: PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: PatternEvent[] = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

const keyInput: KeyInput = {
  key: 'Enter',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
}

runtime.resolveKeyboardBinding(keyInput, 'primary')
void runtime
`
}

function cjsTypeSmokeSource(smokeKind) {
  const packagePath = smokeKind === 'core' ? '@interactive-os/apg-patterns/core' : '@interactive-os/apg-patterns'
  const reactSmoke = smokeKind === 'react'
    ? `
import reactApi = require('@interactive-os/apg-patterns/react')

const Component: typeof reactApi.Button = reactApi.Button
const button = reactApi.useButtonPattern(data, (event: coreApi.PatternEvent) => events.push(event))
void button.rootProps
void Component
`
    : ''

  return `import coreApi = require('${packagePath}')

const data: coreApi.PatternData = {
  items: { primary: { label: 'Primary' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: coreApi.PatternEvent[] = []
const runtime = coreApi.createPatternRuntime({
  definition: coreApi.buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

const keyInput: coreApi.KeyInput = {
  key: 'Enter',
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  metaKey: false,
}

runtime.resolveKeyboardBinding(keyInput, 'primary')

// @ts-expect-error React hooks must stay behind the /react subpath.
void coreApi.useButtonPattern
// @ts-expect-error React preset components must stay behind the /react subpath.
void coreApi.Button
${reactSmoke}
void runtime
`
}
