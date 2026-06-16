import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
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
  assertRuntimeEntrypointIsSchemaFree(packageRootInConsumer)
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

  console.log('interaction package smoke passed for npm pack contents, runtime/definition/APG/React subpaths, TypeScript resolution, and schema isolation')
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
    'dist/apg.js',
    'dist/apg.cjs',
    'dist/apg.d.ts',
    'dist/apg.d.cts',
    'dist/runtime.js',
    'dist/runtime.cjs',
    'dist/runtime.d.ts',
    'dist/runtime.d.cts',
    'dist/definition.js',
    'dist/definition.cjs',
    'dist/definition.d.ts',
    'dist/definition.d.cts',
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

function assertRuntimeEntrypointIsSchemaFree(packageRootInConsumer) {
  for (const entry of ['dist/runtime.js', 'dist/runtime.cjs', 'dist/apg.js', 'dist/apg.cjs']) {
    const files = collectLocalRuntimeFiles(packageRootInConsumer, entry, new Set())
    for (const file of files) {
      const contents = readFileSync(join(packageRootInConsumer, file), 'utf8')
      if (/from ["']zod["']|require\(["']zod["']\)|InteractionOwnerDefinitionSchema|z\.object/.test(contents)) {
        throw new Error(`runtime entrypoint includes schema code through ${file}`)
      }
    }
  }
}

function collectLocalRuntimeFiles(packageRootInConsumer, file, visited) {
  if (visited.has(file)) return visited
  visited.add(file)

  const contents = readFileSync(join(packageRootInConsumer, file), 'utf8')
  const importPattern = /(?:from\s+|import\(|require\()["'](\.\/[^"']+)["']\)?/g
  for (const match of contents.matchAll(importPattern)) {
    const importPath = match[1]
    const nextFile = join(dirname(file), importPath)
    if (nextFile.startsWith('dist/') && existsSync(join(packageRootInConsumer, nextFile))) {
      collectLocalRuntimeFiles(packageRootInConsumer, nextFile, visited)
    }
  }

  return visited
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
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} from '@interactive-os/interaction'
import { createApgInteractionOwner } from '@interactive-os/interaction/apg'
import {
  createInteractionRouter,
  shellOwner,
} from '@interactive-os/interaction/runtime'
import {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
} from '@interactive-os/interaction/definition'
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

const router = createInteractionRouter({
  platform: 'mac',
  owners: [shellOwner({
    id: 'shell',
    keys: [{ key: 'k', code: 'KeyK', mod: 'primary', action: 'palette.open' }],
  })],
})
const shortcutRoute = router.route({ key: 'k', code: 'KeyK', metaKey: true, targetKind: 'pattern' })
if (shortcutRoute.status !== 'owner') throw new Error('expected runtime shortcut route')

const apgOwner = createApgInteractionOwner({
  id: 'tree-bridge',
  definition: {
    apgPattern: 'treeview',
    rootRole: 'tree',
    focusModel: 'ariaActiveDescendant',
    keyboard: [{ shortcut: 'ArrowDown', cases: [{ events: [{ type: 'navigate' }] }] }],
  },
})
const bridgeRouter = createInteractionRouter({ owners: [apgOwner], activeOwnerId: apgOwner.id })
if (bridgeRouter.route({ key: 'ArrowDown', targetKind: 'scroll-container' }).status !== 'owner') {
  throw new Error('expected APG bridge owner route')
}
if (typeof InteractionProvider !== 'function') throw new Error('missing React provider')
`)

  writeFileSync(join(consumerRoot, 'cjs-smoke.cjs'), `
const {
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} = require('@interactive-os/interaction')
const { createApgInteractionOwner } = require('@interactive-os/interaction/apg')
const {
  createInteractionRouter,
  shellOwner,
} = require('@interactive-os/interaction/runtime')
const {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
} = require('@interactive-os/interaction/definition')
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

const router = createInteractionRouter({
  platform: 'mac',
  owners: [shellOwner({
    id: 'shell',
    keys: [{ key: 'k', code: 'KeyK', mod: 'primary', action: 'palette.open' }],
  })],
})
const shortcutRoute = router.route({ key: 'k', code: 'KeyK', metaKey: true, targetKind: 'pattern' })
if (shortcutRoute.status !== 'owner') throw new Error('expected runtime shortcut route')

const apgOwner = createApgInteractionOwner({
  id: 'tree-bridge',
  definition: {
    apgPattern: 'treeview',
    rootRole: 'tree',
    focusModel: 'ariaActiveDescendant',
    keyboard: [{ shortcut: 'ArrowDown', cases: [{ events: [{ type: 'navigate' }] }] }],
  },
})
const bridgeRouter = createInteractionRouter({ owners: [apgOwner], activeOwnerId: apgOwner.id })
if (bridgeRouter.route({ key: 'ArrowDown', targetKind: 'scroll-container' }).status !== 'owner') {
  throw new Error('expected APG bridge owner route')
}
if (typeof InteractionProvider !== 'function') throw new Error('missing React provider')
`)

  writeFileSync(join(consumerRoot, 'types-smoke.ts'), `
import {
  createInteractionOwnershipRegistry,
  routeInteractionKey,
  type InteractionOwner,
} from '@interactive-os/interaction'
import { createApgInteractionOwner } from '@interactive-os/interaction/apg'
import {
  createInteractionActions,
  createInteractionOwner,
  createInteractionRouter,
  getInteractionRouteAction,
  shellOwner,
  type InteractionActionDescriptorFor,
  type InteractionOwnerDefinition,
} from '@interactive-os/interaction/runtime'
import {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
} from '@interactive-os/interaction/definition'
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
const uncheckedOwner = createInteractionOwner({
  id: 'shell-unchecked',
  kind: 'shell',
})
const router = createInteractionRouter({
  platform: 'mac',
  owners: [shellOwner({
    id: 'shell-shortcut',
    keys: [{ key: 'k', mod: 'primary', action: 'palette.open' }],
  })],
})
const apgOwner = createApgInteractionOwner({
  id: 'tree-bridge',
  definition: {
    apgPattern: 'treeview',
    rootRole: 'tree',
    focusModel: 'ariaActiveDescendant',
    keyboard: [{ shortcut: 'ArrowDown', cases: [{ events: [{ type: 'navigate' }] }] }],
  },
})
type Actions = {
  'palette.open': void
  'palette.move': { delta: number }
}
const shortcutRoute = router.route({ key: 'k', metaKey: true, targetKind: 'pattern' })
const action = getInteractionRouteAction<Actions, 'palette.open'>(shortcutRoute, 'palette.open')
const actionHelpers = createInteractionActions<Actions>()
const moveAction = actionHelpers.getRoute({
  matchedKeyRule: { action: { type: 'palette.move', params: { delta: 1 } } },
}, 'palette.move')
const delta: number | undefined = moveAction?.params.delta
type ActionDescriptor = InteractionActionDescriptorFor<Actions>

route.status satisfies 'owner' | 'restore' | 'native' | 'ignored'
platformRoute.status satisfies 'owner' | 'restore' | 'native' | 'ignored'
uncheckedOwner.kind satisfies InteractionOwner['kind']
apgOwner.kind satisfies InteractionOwner['kind']
action?.type satisfies 'palette.open' | undefined
delta satisfies number | undefined
void (null as ActionDescriptor | null)
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
