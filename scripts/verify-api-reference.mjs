import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const apiReferencePath = new URL('API.md', repoRoot)
const shouldWrite = process.argv.includes('--write')
const failures = []
const forbiddenPublicExports = new Map([
  ['COMBOBOX_KEY', 'use comboboxRootKey'],
  ['AriaSources', 'use serializable aria source strings directly'],
  ['definePatternContract', 'use pattern schemas and createPatternRuntime directly'],
  ['defineDomEventHandlerProp', 'use defineDomEvent with a handlerProp descriptor'],
  ['Directions', 'avoid unused vocabulary aliases'],
  ['DomEvents', 'use serializable DOM event strings directly'],
  ['gridRows', 'keep grid row derivation internal'],
  ['hasAriaSource', 'use isRegisteredAriaSource'],
  ['hasNavigationTarget', 'use isRegisteredNavigationTarget'],
  ['hasPredicate', 'use isRegisteredPredicate'],
  ['hasVisibleOrder', 'use isRegisteredVisibleOrder'],
  ['hasKeyToken', 'resolveKeyToken already fails on unknown key tokens'],
  ['handlePatternTrapFocus', 'keep React focus trap handling internal'],
  ['LandmarkKind', 'keep landmark item details on ReactLandmarkItem'],
  ['KeyTokens', 'use serializable key token strings directly'],
  ['NavigationTargets', 'avoid unused vocabulary aliases'],
  ['PatternContract', 'use pattern schemas and createPatternRuntime directly'],
  ['PatternDataBase', 'use PatternData directly'],
  ['PatternDataOf', 'use PatternData<TItem, TState> directly'],
  ['PatternDataWithOptions', 'pass options through hook/component options arguments'],
  ['PatternOptionsOf', 'infer options from the pattern options schema directly'],
  ['PatternStateWithOptions', 'pass options through hook/component options arguments'],
  ['reactKeyInput', 'keep React event adaptation internal'],
  ['ReactPatternProps', 'use the named hook/component return types instead'],
  ['reactProps', 'keep React prop casting internal'],
  ['ReactRenderItemState', 'use each pattern render item state type instead'],
  ['ReactTabsProps', 'use ReactTabsRuntime return types directly'],
  ['ReactTreeviewProps', 'use ReactTreeviewRuntime return types directly'],
  ['sliderContract', 'use sliderDefinition and slider schemas directly'],
  ['SliderData', 'use PatternData with slider item fields directly'],
  ['SliderStateSchema', 'slider state has no slider-specific schema'],
  ['StateSources', 'avoid unused vocabulary aliases'],
  ['Tree', 'use Treeview to match the APG pattern name'],
  ['TreeProps', 'use TreeviewProps to match the APG pattern name'],
  ['TreeviewSlotProps', 'use the shared SlotProps type'],
  ['usePatternEffects', 'keep React effect execution internal'],
  ['useReactPatternRuntime', 'keep React runtime composition internal'],
  ['useRovingFocusEventHandler', 'keep roving focus event handling internal'],
  ['VisibleOrders', 'avoid unused vocabulary aliases'],
  ['windowsplitterDefinition', 'use windowSplitterDefinition'],
])

if (!existsSync(apiReferencePath)) {
  throw new Error('API.md is required')
}

let apiReference = readFileSync(apiReferencePath, 'utf8')
const rootExports = declarationExports('dist/index.d.ts')
const coreExports = declarationExports('dist/core.d.ts')
const reactExports = declarationExports('dist/react.d.ts')
const rootRuntimeExports = await runtimeExports('dist/index.js')
const coreRuntimeExports = await runtimeExports('dist/core.js')
const reactRuntimeExports = await runtimeExports('dist/react.js')

expectExactExportSet(rootExports, coreExports, 'root exports', './core exports')
expectExactExportSet(rootRuntimeExports, coreRuntimeExports, 'root runtime exports', './core runtime exports')
expectExportSuperset(rootExports, rootRuntimeExports, 'root declaration exports', 'root runtime exports')
expectExportSuperset(reactExports, reactRuntimeExports, './react declaration exports', './react runtime exports')
assertNoForbiddenPublicExports('root/core declaration exports', coreExports)
assertNoForbiddenPublicExports('root/core runtime exports', rootRuntimeExports)
assertNoForbiddenPublicExports('./react declaration exports', reactExports)
assertNoForbiddenPublicExports('./react runtime exports', reactRuntimeExports)

const reactOnlyExports = reactExports.filter((name) => !coreExports.includes(name))
const reactOnlyRuntimeExports = reactRuntimeExports.filter((name) => !coreRuntimeExports.includes(name))
const nextApiReference = shouldWrite
  ? replaceExportBlock(
    replaceExportBlock(
      replaceExportBlock(
        replaceExportBlock(apiReference, 'root-core', coreExports),
        'root-core-runtime',
        rootRuntimeExports,
      ),
      'react-only',
      reactOnlyExports,
    ),
    'react-only-runtime',
    reactOnlyRuntimeExports,
  )
  : apiReference
const wroteApiReference = shouldWrite && nextApiReference !== apiReference
if (wroteApiReference) {
  writeFileSync(apiReferencePath, nextApiReference)
  apiReference = nextApiReference
}

assertContains("import { createPatternRuntime } from '@interactive-os/aria'")
assertContains("import { createPatternRuntime } from '@interactive-os/aria/core'")
assertContains("import { Button, useButtonPattern } from '@interactive-os/aria/react'")
assertContains("import type { PatternData, PatternEvent } from '@interactive-os/aria'")
assertExportBlock('root-core', coreExports)
assertExportBlock('root-core-runtime', rootRuntimeExports)
assertExportBlock('react-only', reactOnlyExports)
assertExportBlock('react-only-runtime', reactOnlyRuntimeExports)

if (failures.length > 0) {
  console.error(`API reference check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`${wroteApiReference ? 'Updated API reference and verified' : 'API reference covers'} ${coreExports.length} root/core exports, ${rootRuntimeExports.length} root/core runtime values, ${reactOnlyExports.length} React-only exports, and ${reactOnlyRuntimeExports.length} React-only runtime values.`)

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
    failures.push(`${packagePath} has declaration diagnostics:\n${ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: (filename) => filename,
      getCurrentDirectory: () => fileURLToPath(repoRoot),
      getNewLine: () => '\n',
    })}`)
  }

  const sourceFile = program.getSourceFile(filePath)
  const symbol = sourceFile ? program.getTypeChecker().getSymbolAtLocation(sourceFile) : null
  if (!symbol) {
    failures.push(`${packagePath} does not have a declaration module symbol`)
    return []
  }

  return program.getTypeChecker()
    .getExportsOfModule(symbol)
    .map((exported) => exported.getName())
    .sort((left, right) => left.localeCompare(right))
}

async function runtimeExports(packagePath) {
  return Object.keys(await import(new URL(packagePath, repoRoot))).sort((left, right) => left.localeCompare(right))
}

function expectExactExportSet(actual, expected, actualLabel, expectedLabel) {
  expectExportSuperset(actual, expected, actualLabel, expectedLabel)
  expectExportSuperset(expected, actual, expectedLabel, actualLabel)
}

function expectExportSuperset(actual, expected, actualLabel, expectedLabel) {
  const actualSet = new Set(actual)
  const missingNames = expected.filter((name) => !actualSet.has(name))
  if (missingNames.length > 0) {
    failures.push(`${actualLabel} must include every ${expectedLabel}: ${missingNames.join(', ')}`)
  }
}

function assertContains(text) {
  if (!apiReference.includes(text)) failures.push(`API.md must include ${text}`)
}

function assertNoForbiddenPublicExports(label, exports) {
  for (const name of exports) {
    const reason = forbiddenPublicExports.get(name)
    if (reason) failures.push(`${label} must not expose ${name}: ${reason}`)
  }
}

function assertExportBlock(name, exports) {
  const actual = readExportBlock(name)
  if (actual === null) return

  const expected = exportBlockSource(exports)
  if (actual !== expected) failures.push(`API.md ${name} export block is out of date`)
}

function replaceExportBlock(source, name, exports) {
  const markers = exportBlockMarkers(name, source)
  if (!markers) return source

  return `${source.slice(0, markers.startIndex + markers.startMarker.length)}\n${exportBlockSource(exports)}\n${source.slice(markers.endIndex)}`
}

function readExportBlock(name) {
  const markers = exportBlockMarkers(name, apiReference)
  if (!markers) return null
  return apiReference.slice(markers.startIndex + markers.startMarker.length, markers.endIndex).trim()
}

function exportBlockMarkers(name, source) {
  const startMarker = `<!-- apg-api:${name}:start -->`
  const endMarker = `<!-- apg-api:${name}:end -->`
  const startIndex = source.indexOf(startMarker)
  const endIndex = source.indexOf(endMarker)
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    failures.push(`API.md is missing ${name} export markers`)
    return null
  }

  return { startMarker, startIndex, endIndex }
}

function exportBlockSource(exports) {
  return ['```txt', ...exports, '```'].join('\n')
}
