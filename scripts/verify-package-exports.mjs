import { access, mkdir, mkdtemp, readFile, rm, symlink } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const repoRootPath = fileURLToPath(repoRoot)
const require = createRequire(import.meta.url)
const packageJson = JSON.parse(await readFile(new URL('package.json', repoRoot), 'utf8'))
const checkedPaths = new Set()
const missing = []
const declarationSurfaces = [
  {
    label: 'ESM',
    root: 'dist/index.d.ts',
    core: 'dist/core.d.ts',
    react: 'dist/react.d.ts',
  },
  {
    label: 'CJS',
    root: 'dist/index.d.cts',
    core: 'dist/core.d.cts',
    react: 'dist/react.d.cts',
  },
]
const runtimeSurfaces = [
  {
    label: 'root',
    esm: 'dist/index.js',
    cjs: 'dist/index.cjs',
    esmDeclaration: 'dist/index.d.ts',
    cjsDeclaration: 'dist/index.d.cts',
  },
  {
    label: './core',
    esm: 'dist/core.js',
    cjs: 'dist/core.cjs',
    esmDeclaration: 'dist/core.d.ts',
    cjsDeclaration: 'dist/core.d.cts',
  },
  {
    label: './react',
    esm: 'dist/react.js',
    cjs: 'dist/react.cjs',
    esmDeclaration: 'dist/react.d.ts',
    cjsDeclaration: 'dist/react.d.cts',
  },
]
const reactAdapterExports = [
  'Accordion',
  'Alert',
  'AlertDialog',
  'Breadcrumb',
  'Button',
  'Carousel',
  'Checkbox',
  'Combobox',
  'Dialog',
  'Disclosure',
  'Feed',
  'Grid',
  'Landmarks',
  'Link',
  'Listbox',
  'MenuButton',
  'Menubar',
  'Meter',
  'RadioGroup',
  'Slider',
  'Spinbutton',
  'Switch',
  'Table',
  'Tabs',
  'Toolbar',
  'Tooltip',
  'Treeview',
  'Treegrid',
  'WindowSplitter',
  'useAccordionPattern',
  'useAlertPattern',
  'useAlertDialogPattern',
  'useBreadcrumbPattern',
  'useButtonPattern',
  'useCarouselPattern',
  'useCheckboxPattern',
  'useAutocompleteListbox',
  'useComboboxPattern',
  'useDialogPattern',
  'useDisclosurePattern',
  'useFeedPattern',
  'useGridPattern',
  'useLandmarksPattern',
  'useLinkPattern',
  'useListboxPattern',
  'useMenuButtonPattern',
  'useMenubarPattern',
  'useMeterPattern',
  'useRadioGroupPattern',
  'useSliderPattern',
  'useSpinbuttonPattern',
  'useSwitchPattern',
  'useTablePattern',
  'useTabsPattern',
  'useToolbarPattern',
  'useTooltipPattern',
  'useTreegridPattern',
  'useTreeviewPattern',
  'useWindowSplitterPattern',
]

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

assertDeclarationExportSurface()
await assertConditionalDeclarationResolution()
await assertRuntimeExportSurface()

if (missing.length > 0) {
  throw new Error(`package export validation failed:\n${missing.join('\n')}`)
}

console.log(`package manifest references ${checkedPaths.size} existing files or directories, and ESM/CJS declaration/runtime exports plus TypeScript resolution preserve root/core/react boundaries`)

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

function assertDeclarationExportSurface() {
  let previousSurface = null
  for (const surface of declarationSurfaces) {
    const exports = {
      root: declarationExports(surface.root),
      core: declarationExports(surface.core),
      react: declarationExports(surface.react),
    }

    assertPublicEntryDeclarationExports(surface.label, exports)

    if (previousSurface) {
      expectExactExportSet(exports.root, previousSurface.exports.root, `${surface.label} root declaration exports`, `${previousSurface.label} root declaration exports`)
      expectExactExportSet(exports.core, previousSurface.exports.core, `${surface.label} ./core declaration exports`, `${previousSurface.label} ./core declaration exports`)
      expectExactExportSet(exports.react, previousSurface.exports.react, `${surface.label} ./react declaration exports`, `${previousSurface.label} ./react declaration exports`)
    }

    previousSurface = { label: surface.label, exports }
  }
}

async function assertConditionalDeclarationResolution() {
  const tempRoot = await mkdtemp(join(tmpdir(), 'aria-resolution-'))
  try {
    await mkdir(join(tempRoot, 'node_modules', '@interactive-os'), { recursive: true })
    await symlink(repoRootPath, join(tempRoot, 'node_modules', '@interactive-os', 'aria'), 'dir')

    for (const scenario of declarationResolutionScenarios()) {
      const resolved = resolvePackageSpecifier(tempRoot, scenario.specifier, scenario.resolutionMode)
      const expected = fileURLToPath(new URL(scenario.expected, repoRoot))
      if (!resolved) {
        missing.push(`${scenario.label} must resolve ${scenario.specifier} to ${scenario.expected}`)
        continue
      }
      if (resolved !== expected) {
        missing.push(`${scenario.label} must resolve ${scenario.specifier} to ${scenario.expected}; resolved ${relativePath(resolved)}`)
      }
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

function declarationResolutionScenarios() {
  return [
    {
      label: 'ESM root declaration',
      specifier: '@interactive-os/aria',
      resolutionMode: ts.ModuleKind.ESNext,
      expected: 'dist/index.d.ts',
    },
    {
      label: 'CJS root declaration',
      specifier: '@interactive-os/aria',
      resolutionMode: ts.ModuleKind.CommonJS,
      expected: 'dist/index.d.cts',
    },
    {
      label: 'ESM ./core declaration',
      specifier: '@interactive-os/aria/core',
      resolutionMode: ts.ModuleKind.ESNext,
      expected: 'dist/core.d.ts',
    },
    {
      label: 'CJS ./core declaration',
      specifier: '@interactive-os/aria/core',
      resolutionMode: ts.ModuleKind.CommonJS,
      expected: 'dist/core.d.cts',
    },
    {
      label: 'ESM ./react declaration',
      specifier: '@interactive-os/aria/react',
      resolutionMode: ts.ModuleKind.ESNext,
      expected: 'dist/react.d.ts',
    },
    {
      label: 'CJS ./react declaration',
      specifier: '@interactive-os/aria/react',
      resolutionMode: ts.ModuleKind.CommonJS,
      expected: 'dist/react.d.cts',
    },
  ]
}

function resolvePackageSpecifier(tempRoot, specifier, resolutionMode) {
  const containingFile = join(tempRoot, resolutionMode === ts.ModuleKind.CommonJS ? 'consumer.cts' : 'consumer.mts')
  return ts.resolveModuleName(
    specifier,
    containingFile,
    {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: true,
    },
    ts.sys,
    undefined,
    undefined,
    resolutionMode,
  ).resolvedModule?.resolvedFileName
}

async function assertRuntimeExportSurface() {
  const surfaces = []

  for (const entry of runtimeSurfaces) {
    const exports = {
      esm: await runtimeExports(entry.esm, 'esm'),
      cjs: await runtimeExports(entry.cjs, 'cjs'),
    }
    const runtimeLabel = `${entry.label} runtime exports`

    expectExactExportSet(exports.esm, exports.cjs, `${entry.label} ESM runtime exports`, `${entry.label} CJS runtime exports`)
    expectExportSuperset(declarationExports(entry.esmDeclaration), exports.esm, `${entry.label} ESM declaration exports`, `${entry.label} ESM runtime exports`)
    expectExportSuperset(declarationExports(entry.cjsDeclaration), exports.cjs, `${entry.label} CJS declaration exports`, `${entry.label} CJS runtime exports`)

    if (exports.esm.has('default')) missing.push(`${runtimeLabel} must not expose an ESM default export`)
    if (exports.cjs.has('default')) missing.push(`${runtimeLabel} must not expose a CJS default export`)

    surfaces.push({ label: entry.label, exports: exports.esm })
  }

  const root = surfaces.find((surface) => surface.label === 'root')
  const core = surfaces.find((surface) => surface.label === './core')
  const react = surfaces.find((surface) => surface.label === './react')
  if (!root || !core || !react) return

  expectExactExportSet(root.exports, core.exports, 'root runtime exports', './core runtime exports')
  expectExportSuperset(react.exports, core.exports, './react runtime exports', './core runtime exports')
}

async function runtimeExports(packagePath, moduleKind) {
  const path = fileURLToPath(new URL(packagePath, repoRoot))
  const module = moduleKind === 'esm' ? await import(new URL(packagePath, repoRoot)) : require(path)
  return new Set(Object.keys(module))
}

function assertPublicEntryDeclarationExports(label, exports) {
  const { root: rootExports, core: coreExports, react: reactExports } = exports
  const rootLabel = `${label} root declaration exports`
  const coreLabel = `${label} ./core declaration exports`
  const reactLabel = `${label} ./react declaration exports`

  expectExactExportSet(rootExports, coreExports, rootLabel, coreLabel)
  expectExportSuperset(reactExports, coreExports, reactLabel, coreLabel)

  for (const name of reactAdapterExports) {
    if (!reactExports.has(name)) missing.push(`${reactLabel} must include ${name}`)
    if (rootExports.has(name)) missing.push(`${rootLabel} must not include React adapter API ${name}`)
    if (coreExports.has(name)) missing.push(`${coreLabel} must not include React adapter API ${name}`)
  }

  for (const [label, exports] of [
    [rootLabel, rootExports],
    [coreLabel, coreExports],
    [reactLabel, reactExports],
  ]) {
    if (exports.has('default')) missing.push(`${label} must not expose a default export`)
  }
}

function declarationExports(packagePath) {
  const filePath = fileURLToPath(new URL(packagePath, repoRoot))
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: true,
  })
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
  if (diagnostics.length > 0) {
    missing.push(`${packagePath} has declaration diagnostics:\n${ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (filename) => filename,
      getCurrentDirectory: () => fileURLToPath(repoRoot),
      getNewLine: () => '\n',
    })}`)
  }

  const sourceFile = program.getSourceFile(filePath)
  const symbol = sourceFile ? program.getTypeChecker().getSymbolAtLocation(sourceFile) : null
  if (!symbol) {
    missing.push(`${packagePath} does not have a declaration module symbol`)
    return new Set()
  }

  return new Set(program.getTypeChecker().getExportsOfModule(symbol).map((exported) => exported.getName()))
}

function expectExactExportSet(actual, expected, actualLabel, expectedLabel) {
  expectExportSuperset(actual, expected, actualLabel, expectedLabel)
  expectExportSuperset(expected, actual, expectedLabel, actualLabel)
}

function expectExportSuperset(actual, expected, actualLabel, expectedLabel) {
  const missingNames = [...expected].filter((name) => !actual.has(name)).sort()
  if (missingNames.length > 0) {
    missing.push(`${actualLabel} must include every ${expectedLabel}: ${missingNames.join(', ')}`)
  }
}

function relativePath(path) {
  return path.replace(`${repoRootPath}/`, '')
}
