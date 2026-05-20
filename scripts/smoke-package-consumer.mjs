import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
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
    consumerRoot: join(tempRoot, 'consumer-npm-install-react'),
    includeReact: true,
    smokeKind: 'react',
  })

  console.log('package consumer smoke passed for ESM, CJS, script-enabled npm tarball install with transitive runtime dependencies and optional React, Vite bundler build, NodeNext/Bundler/CJS TypeScript, package metadata, package export encapsulation, React-free root/core imports, root/core React API boundaries, and React TSX subpath imports.')
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

  execFileSync('npm', ['install', '--no-audit', '--no-fund', '--package-lock=false'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })
  assertRuntimeDependencyInstallState(consumerRoot)
  assertReactInstallState(consumerRoot, includeReact)

  writeConsumerFiles(consumerRoot, smokeKind, { writePackageJson: false })
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.bundler.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.cjs-nodenext.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })
  if (includeReact) runViteBundlerSmoke(consumerRoot)
}

function packCurrentPackage(destination) {
  const stdout = execFileSync('npm', ['pack', '--pack-destination', destination, '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const result = JSON.parse(stdout)
  const filename = result[0]?.filename
  if (!filename) throw new Error('npm pack did not return a tarball filename')
  const tarballPath = join(destination, filename)
  if (!existsSync(tarballPath)) throw new Error(`npm pack did not create ${tarballPath}`)
  return tarballPath
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

function runViteBundlerSmoke(consumerRoot) {
  mkdirSync(join(consumerRoot, 'src'), { recursive: true })
  writeFileSync(join(consumerRoot, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.ts"></script></body></html>\n')
  writeFileSync(join(consumerRoot, 'src/main.ts'), viteConsumerSource())
  execFileSync(join(repoRoot, 'node_modules/.bin/vite'), ['build', '--logLevel', 'error'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })
  if (!existsSync(join(consumerRoot, 'dist/index.html'))) {
    throw new Error('Vite consumer build did not create dist/index.html')
  }
}

function viteConsumerSource() {
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
${metadataSmoke}
${reactSmoke}
${deepImportSmoke}
`
}

function packageMetadataSmokeSource() {
  const expectedMetadata = {
    name: packageJson.name,
    version: packageJson.version,
    license: packageJson.license,
    author: packageJson.author,
    private: false,
    reactPeerOptional: packageJson.peerDependenciesMeta?.react?.optional === true,
    packageJsonExport: packageJson.exports?.['./package.json'],
  }

  return `
const packageMetadata = require('@interactive-os/apg-patterns/package.json')
const expectedMetadata = ${JSON.stringify(expectedMetadata, null, 2)}

for (const key of ['name', 'version', 'license', 'author']) {
  if (packageMetadata[key] !== expectedMetadata[key]) {
    throw new Error(\`package metadata export did not expose \${key}\`)
  }
}
if (packageMetadata.private === true) throw new Error('package metadata export marked the package private')
if (packageMetadata.peerDependenciesMeta?.react?.optional !== expectedMetadata.reactPeerOptional) {
  throw new Error('package metadata export did not expose the optional React peer')
}
if (packageMetadata.exports?.['./package.json'] !== expectedMetadata.packageJsonExport) {
  throw new Error('package metadata export did not expose its metadata subpath')
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
