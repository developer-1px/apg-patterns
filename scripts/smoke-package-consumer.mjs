import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tempRoot = mkdtempSync(join(tmpdir(), 'apg-patterns-consumer-'))

try {
  const tarballPath = packCurrentPackage(tempRoot)
  const consumerRoot = join(tempRoot, 'consumer')
  const nodeModules = join(consumerRoot, 'node_modules')
  const packageRoot = join(nodeModules, '@interactive-os', 'apg-patterns')

  mkdirSync(join(nodeModules, '@interactive-os'), { recursive: true })
  mkdirSync(join(nodeModules, '@types'), { recursive: true })
  execFileSync('tar', ['-xzf', tarballPath, '-C', join(nodeModules, '@interactive-os')], { cwd: repoRoot })
  renameSync(join(nodeModules, '@interactive-os', 'package'), packageRoot)

  linkPackageDependency(nodeModules, 'zod')
  linkPackageDependency(nodeModules, 'react')
  linkPackageDependency(nodeModules, '@types/react')
  linkPackageDependency(nodeModules, 'csstype')

  writeConsumerFiles(consumerRoot)
  execFileSync(process.execPath, ['esm-smoke.mjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(process.execPath, ['cjs-smoke.cjs'], { cwd: consumerRoot, stdio: 'pipe' })
  execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--project', 'tsconfig.json', '--noEmit'], { cwd: consumerRoot, stdio: 'pipe' })

  console.log('package consumer smoke passed for ESM, CJS, and TypeScript.')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
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

function writeConsumerFiles(consumerRoot) {
  writeFileSync(join(consumerRoot, 'package.json'), JSON.stringify({ private: true, type: 'module' }, null, 2))
  writeFileSync(join(consumerRoot, 'esm-smoke.mjs'), runtimeSmokeSource('esm'))
  writeFileSync(join(consumerRoot, 'cjs-smoke.cjs'), runtimeSmokeSource('cjs'))
  writeFileSync(join(consumerRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      strict: true,
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM'],
      skipLibCheck: false,
    },
    include: ['type-smoke.ts'],
  }, null, 2))
  writeFileSync(join(consumerRoot, 'type-smoke.ts'), readFileSync(new URL('./fixtures/package-consumer-type-smoke.ts', import.meta.url), 'utf8'))
}

function runtimeSmokeSource(moduleKind) {
  const importLine = moduleKind === 'esm'
    ? "import { buttonDefinition, createPatternRuntime } from '@interactive-os/apg-patterns'"
    : "const { buttonDefinition, createPatternRuntime } = require('@interactive-os/apg-patterns')"

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
`
}
