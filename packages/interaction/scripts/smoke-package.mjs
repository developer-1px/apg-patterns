import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const tempRoot = mkdtempSync(join(tmpdir(), 'interaction-package-'))

try {
  const tarballPath = packPackage(tempRoot)
  const consumerRoot = join(tempRoot, 'consumer')
  const packageInstallRoot = join(consumerRoot, 'node_modules', '@interactive-os')
  const packageRootInConsumer = join(packageInstallRoot, 'interaction')

  mkdirSync(packageInstallRoot, { recursive: true })
  execFileSync('tar', ['-xzf', tarballPath, '-C', packageInstallRoot], { cwd: packageRoot })
  renameSync(join(packageInstallRoot, 'package'), packageRootInConsumer)
  linkDependency(consumerRoot, 'react')
  linkDependency(consumerRoot, '@types/react')
  linkDependency(consumerRoot, 'csstype')
  linkDependency(consumerRoot, 'zod')

  writeConsumerFiles(consumerRoot)
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--project', 'tsconfig.json', '--noEmit'], {
    cwd: consumerRoot,
    stdio: 'pipe',
  })

  console.log('interaction package smoke passed for npm pack contents, ESM, CJS, React subpath, and TypeScript resolution')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}

function packPackage(destination) {
  const stdout = execFileSync('npm', ['pack', '--pack-destination', destination, '--json'], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
  const result = JSON.parse(stdout)
  const pack = result[0]
  const filename = pack?.filename
  if (!filename) throw new Error('npm pack did not return a tarball filename')
  if (!Array.isArray(pack.files)) throw new Error('npm pack did not return packed file metadata')

  const packedPaths = new Set(pack.files.map((file) => file.path))
  const requiredPaths = [
    'package.json',
    'README.md',
    'API.md',
    'INTERFACE_STABILITY.md',
    'CHANGELOG.md',
    'LICENSE',
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/index.d.cts',
    'dist/react.js',
    'dist/react.cjs',
    'dist/react.d.ts',
    'dist/react.d.cts',
  ]

  for (const path of requiredPaths) {
    if (!packedPaths.has(path)) throw new Error(`packed package missing ${path}`)
  }

  for (const file of pack.files) {
    if (/^(src|scripts)\//.test(file.path)) {
      throw new Error(`packed package includes non-runtime path ${file.path}`)
    }
    if (/\.test\.[cm]?[jt]sx?$/.test(file.path)) {
      throw new Error(`packed package includes test file ${file.path}`)
    }
  }

  const tarballPath = join(destination, filename)
  if (!existsSync(tarballPath)) throw new Error(`npm pack did not create ${tarballPath}`)
  return tarballPath
}

function linkDependency(consumerRoot, name) {
  const source = dirname(require.resolve(`${name}/package.json`))
  const target = join(consumerRoot, 'node_modules', ...name.split('/'))
  mkdirSync(dirname(target), { recursive: true })
  symlinkSync(source, target, 'dir')
}

function writeConsumerFiles(consumerRoot) {
  mkdirSync(consumerRoot, { recursive: true })
  writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
  }, null, 2))

  writeFileSync(join(consumerRoot, 'esm-smoke.mjs'), `
import {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} from '@interactive-os/interaction'
import { InteractionProvider } from '@interactive-os/interaction/react'

const registry = createInteractionOwnershipRegistry()
registry.register(compileInteractionOwnerDefinition({
  id: 'tree',
  kind: 'tree',
  keyRules: [{
    id: 'tree.down',
    kind: 'navigation',
    keys: ['ArrowDown'],
    action: { type: 'tree.move', params: { direction: 'next' } },
  }],
}))
registry.activate('tree')
InteractionOwnerDefinitionSchema.parse({ id: 'shell', kind: 'shell' })

const route = routeInteractionKey(registry, {
  key: 'ArrowDown',
  targetKind: 'scroll-container',
})

if (route.status !== 'owner') throw new Error('expected owner route')
if (route.matchedKeyRule?.action?.type !== 'tree.move') throw new Error('expected matched action descriptor')
if (typeof InteractionProvider !== 'function') throw new Error('missing React provider')
`)

  writeFileSync(join(consumerRoot, 'cjs-smoke.cjs'), `
const {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} = require('@interactive-os/interaction')
const { InteractionProvider } = require('@interactive-os/interaction/react')

const registry = createInteractionOwnershipRegistry()
registry.register(compileInteractionOwnerDefinition({
  id: 'tree',
  kind: 'tree',
  keyRules: [{
    id: 'tree.down',
    kind: 'navigation',
    keys: ['ArrowDown'],
    action: { type: 'tree.move', params: { direction: 'next' } },
  }],
}))
registry.activate('tree')
InteractionOwnerDefinitionSchema.parse({ id: 'shell', kind: 'shell' })

const route = routeInteractionKey(registry, {
  key: 'ArrowDown',
  targetKind: 'scroll-container',
})

if (route.status !== 'owner') throw new Error('expected owner route')
if (route.matchedKeyRule?.action?.type !== 'tree.move') throw new Error('expected matched action descriptor')
if (typeof InteractionProvider !== 'function') throw new Error('missing React provider')
`)

  writeFileSync(join(consumerRoot, 'types-smoke.ts'), `
import {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
  createInteractionOwnershipRegistry,
  routeInteractionKey,
  type InteractionOwnerDefinition,
  type InteractionOwner,
} from '@interactive-os/interaction'
import {
  InteractionProvider,
  useInteractionOwner,
} from '@interactive-os/interaction/react'

const owner: InteractionOwner = {
  id: 'tree',
  kind: 'pattern',
  ownsKey: (input) => input.key === 'ArrowDown',
}
const definition: InteractionOwnerDefinition = InteractionOwnerDefinitionSchema.parse({
  id: 'tree-definition',
  kind: 'tree',
  keyRules: [{
    id: 'tree.down',
    kind: 'navigation',
    keys: ['ArrowDown'],
    action: { type: 'tree.move' },
  }],
})

const registry = createInteractionOwnershipRegistry()
registry.register(owner)
registry.register(compileInteractionOwnerDefinition(definition))
registry.activate(owner.id)
const route = routeInteractionKey(registry, { key: 'ArrowDown' })
const platformRoute = routeInteractionKey(registry, { key: 'ArrowDown', platform: 'mac' })

route.status satisfies 'owner' | 'restore' | 'native' | 'ignored'
platformRoute.status satisfies 'owner' | 'restore' | 'native' | 'ignored'
void InteractionProvider
void useInteractionOwner
`)

  writeFileSync(join(consumerRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
    },
    include: ['types-smoke.ts'],
  }, null, 2))
}
