import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const apiReferencePath = new URL('API.md', repoRoot)
const interfaceStabilityPath = new URL('INTERFACE_STABILITY.md', repoRoot)
const publicContractFixturePath = new URL('scripts/fixtures/public-api-contract.json', repoRoot)
const publicPatternFixturePath = new URL('scripts/fixtures/public-pattern-contracts.json', repoRoot)
const publicReactPatternFixturePath = new URL('scripts/fixtures/public-react-pattern-contracts.json', repoRoot)
const shouldWrite = process.argv.includes('--write')
const failures = []
const forbiddenPublicExports = new Map([
  ['COMBOBOX_KEY', 'use the serializable "combobox" data key directly'],
  ['comboboxRootKey', 'keep the combobox synthetic root key internal'],
  ['AccordionDefinitionSchema', 'use PatternDefinitionSchema or accordionDefinition directly'],
  ['AriaSourceSchema', 'use AriaSourcePathSchema'],
  ['AriaSources', 'use serializable aria source strings directly'],
  ['AlertDefinitionSchema', 'use PatternDefinitionSchema or alertDefinition directly'],
  ['AlertDialogDefinitionSchema', 'use PatternDefinitionSchema or alertDialogDefinition directly'],
  ['BreadcrumbDefinitionSchema', 'use PatternDefinitionSchema or breadcrumbDefinition directly'],
  ['CarouselDefinitionSchema', 'use PatternDefinitionSchema or carouselDefinition directly'],
  ['CreateDisclosureRuntimeInput', 'disclosure uses the generic createPatternRuntime input'],
  ['definePatternContract', 'use pattern schemas and createPatternRuntime directly'],
  ['defineDomEventHandlerProp', 'use defineDomEvent with a handlerProp descriptor'],
  ['DialogDefinitionSchema', 'use PatternDefinitionSchema or dialogDefinition directly'],
  ['Directions', 'avoid redundant vocabulary aliases'],
  ['DisclosureDefinitionSchema', 'use PatternDefinitionSchema or disclosureDefinition directly'],
  ['DisclosureRuntime', 'disclosure uses generic PatternRuntime or ReactDisclosureRuntime'],
  ['DomEvents', 'use serializable DOM event strings directly'],
  ['CreateTabsRuntimeInput', 'call createTabsRuntime without exporting its implementation input shape'],
  ['CreateTreeviewRuntimeInput', 'call createTreeviewRuntime without exporting its implementation input shape'],
  ['createDisclosureRuntime', 'use createPatternRuntime with disclosureDefinition'],
  ['gridRows', 'keep grid row derivation internal'],
  ['getTreeItemState', 'keep treeview item state derivation behind Treeview React render items'],
  ['hasAriaSource', 'use isRegisteredAriaSource'],
  ['hasNavigationTarget', 'use isRegisteredNavigationTarget'],
  ['hasPredicate', 'use isRegisteredPredicate'],
  ['hasVisibleOrder', 'use isRegisteredVisibleOrder'],
  ['hasKeyToken', 'resolveKeyToken already fails on unknown key tokens'],
  ['handlePatternTrapFocus', 'keep React focus trap handling internal'],
  ['LandmarksDefinitionSchema', 'use PatternDefinitionSchema or landmarksDefinition directly'],
  ['LinkDefinitionSchema', 'use PatternDefinitionSchema or linkDefinition directly'],
  ['LandmarkKind', 'keep landmark item details on ReactLandmarkItem'],
  ['KeyTokens', 'use serializable key token strings directly'],
  ['NavigationTargets', 'avoid redundant vocabulary aliases'],
  ['PatternContract', 'use pattern schemas and createPatternRuntime directly'],
  ['PatternDataBase', 'use PatternData directly'],
  ['PatternDataOf', 'use PatternData<TItem, TState> directly'],
  ['PatternDataWithOptions', 'pass options through hook/component options arguments'],
  ['PatternOptionsOf', 'infer options from the pattern options schema directly'],
  ['PatternStateWithOptions', 'pass options through hook/component options arguments'],
  ['reactKeyInput', 'keep React event adaptation internal'],
  ['ReactElementName', 'use PatternDefinition["react"]'],
  ['ReactElementNameSchema', 'use PatternDefinitionSchema'],
  ['ReactFacade', 'use PatternDefinition["react"]'],
  ['ReactFacadeSchema', 'use PatternDefinitionSchema'],
  ['ReactHookNameSchema', 'use PatternDefinitionSchema'],
  ['ReactItemFieldName', 'use PatternDefinition["react"]'],
  ['ReactItemFieldNameSchema', 'use PatternDefinitionSchema'],
  ['ReactItemProp', 'use PatternDefinition["react"]'],
  ['ReactItemPropSchema', 'use PatternDefinitionSchema'],
  ['ReactPatternProps', 'use the named hook/component return types instead'],
  ['ReactPropNameSchema', 'use PatternDefinitionSchema'],
  ['ReactPropOwner', 'use PatternDefinition["react"]'],
  ['ReactPropOwnerSchema', 'use PatternDefinitionSchema'],
  ['reactProps', 'keep React prop casting internal'],
  ['ReactRenderItems', 'use PatternDefinition["react"]'],
  ['ReactRenderItemsSchema', 'use PatternDefinitionSchema'],
  ['ReactRenderItemState', 'use each pattern render item state type instead'],
  ['ReactRenderSource', 'use PatternDefinition["react"]'],
  ['ReactRenderSourceSchema', 'use PatternDefinitionSchema'],
  ['ReactRenderValue', 'use PatternDefinition["react"]'],
  ['ReactRenderValueSchema', 'use PatternDefinitionSchema'],
  ['ReactRenderVariant', 'use PatternDefinition["react"]'],
  ['ReactRenderVariantSchema', 'use PatternDefinitionSchema'],
  ['ReactRenderVariantWhen', 'use PatternDefinition["react"]'],
  ['ReactRenderVariantWhenSchema', 'use PatternDefinitionSchema'],
  ['ReactSemanticDefaultProp', 'use PatternDefinition["react"]'],
  ['ReactSemanticDefaultPropSchema', 'use PatternDefinitionSchema'],
  ['ReactSemanticDefaults', 'use PatternDefinition["react"]'],
  ['ReactSemanticDefaultsSchema', 'use PatternDefinitionSchema'],
  ['ReactTabsProps', 'use ReactTabsRuntime return types directly'],
  ['ReactTreeviewProps', 'use ReactTreeviewRuntime return types directly'],
  ['sliderContract', 'use sliderDefinition and slider schemas directly'],
  ['SliderData', 'use PatternData with slider item fields directly'],
  ['SliderItemSchema', 'use PatternData with slider item fields directly'],
  ['SliderOptions', 'use PatternOptions'],
  ['SliderOptionsSchema', 'use PatternOptionsSchema'],
  ['SliderStateSchema', 'slider state has no slider-specific schema'],
  ['StateSources', 'avoid redundant vocabulary aliases'],
  ['TabsDefinitionSchema', 'use PatternDefinitionSchema or tabsDefinition directly'],
  ['TabsRuntime', 'keep tabs runtime construction internal to useTabsPattern'],
  ['ToolbarDefinitionSchema', 'use PatternDefinitionSchema or toolbarDefinition directly'],
  ['TooltipDefinitionSchema', 'use PatternDefinitionSchema or tooltipDefinition directly'],
  ['Tree', 'use Treeview to match the APG pattern name'],
  ['TreeProps', 'use TreeviewProps to match the APG pattern name'],
  ['treegridVisibleCells', 'keep treegrid cell derivation internal to treegrid rendering and navigation'],
  ['treegridVisibleRowKeys', 'keep treegrid row derivation internal to treegrid rendering and navigation'],
  ['TreeviewRenderItem', 'use ReactTreeviewRenderItem from the React entrypoint'],
  ['TreeviewRenderState', 'use ReactTreeviewRenderItem state from the React entrypoint'],
  ['TreeviewRuntime', 'keep treeview runtime construction internal to useTreeviewPattern'],
  ['TreeviewDefinitionSchema', 'use PatternDefinitionSchema or treeviewDefinition directly'],
  ['TreeviewSlotProps', 'use the shared SlotProps type'],
  ['createTabsRuntime', 'keep tabs runtime construction internal to useTabsPattern'],
  ['createTreeviewRuntime', 'keep treeview runtime construction internal to useTreeviewPattern'],
  ['reduceDisclosureData', 'use reducePatternData(disclosureDefinition, data, event)'],
  ['reduceTabsData', 'use reducePatternData(tabsDefinition, data, event) or keep activation policy local'],
  ['resolveTreeviewKeyboardBinding', 'keep treeview keyboard compatibility helpers internal'],
  ['resolveTreeviewNavigationTarget', 'keep treeview navigation compatibility helpers internal'],
  ['resolveTreeviewVisibleKeys', 'keep treeview visible-key derivation internal'],
  ['resolveTypeaheadTarget', 'keep treeview typeahead derivation internal'],
  ['unknownTokenError', 'keep resolver diagnostic construction internal'],
  ['usePatternEffects', 'keep React effect execution internal'],
  ['useReactPatternRuntime', 'keep React runtime composition internal'],
  ['useRovingFocusEventHandler', 'keep roving focus event handling internal'],
  ['VisibleOrders', 'avoid redundant vocabulary aliases'],
  ['windowsplitterDefinition', 'use windowSplitterDefinition'],
])

const surfaceBucketPolicies = new Map([
  ['apg-pattern-definition', { entrypoint: 'root/core', tier: 'permanent-catalog' }],
  ['core-contract-type', { entrypoint: 'root/core', tier: 'permanent-core' }],
  ['schema-validator', { entrypoint: 'root/core', tier: 'permanent-validation' }],
  ['runtime-boundary', { entrypoint: 'root/core', tier: 'permanent-runtime' }],
  ['runtime-resolver', { entrypoint: 'root/core', tier: 'stable-extension' }],
  ['core-data-helper', { entrypoint: 'root/core', tier: 'narrow-core-helper' }],
  ['extension-vocabulary', { entrypoint: 'root/core', tier: 'stable-extension' }],
  ['extension-resolver-type', { entrypoint: 'root/core', tier: 'stable-extension' }],
  ['react-pattern-hook', { entrypoint: 'react-only', tier: 'framework-adapter' }],
  ['react-preset-component', { entrypoint: 'react-only', tier: 'framework-adapter' }],
  ['react-preset-props', { entrypoint: 'react-only', tier: 'framework-adapter' }],
  ['react-data-helper', { entrypoint: 'react-only', tier: 'narrow-react-helper' }],
  ['react-owner-adapter', { entrypoint: 'react-only', tier: 'narrow-react-adapter' }],
  ['react-state-helper', { entrypoint: 'react-only', tier: 'narrow-react-helper' }],
  ['react-runtime-type', { entrypoint: 'react-only', tier: 'framework-adapter' }],
  ['react-render-surface-type', { entrypoint: 'react-only', tier: 'framework-adapter' }],
])

const rootCoreContractTypes = new Set([
  'AriaAttribute',
  'AriaProjection',
  'AriaRole',
  'AriaSourcePath',
  'CreatePatternRuntimeInput',
  'DomEventName',
  'EffectDefinition',
  'ElementTarget',
  'EventTemplate',
  'EventValueSource',
  'FocusModel',
  'FocusProjection',
  'Key',
  'KeyboardBinding',
  'KeyInput',
  'ModifierKeyName',
  'NavigationTargetContext',
  'NavigationTargetKind',
  'PartEventBinding',
  'PatternData',
  'PatternDefinition',
  'PatternDirection',
  'PatternEvent',
  'PatternEventReason',
  'PatternEventType',
  'PatternItem',
  'PatternOptions',
  'PatternRuntime',
  'PatternRuntimeContext',
  'PatternState',
  'PatternValueStepDirection',
  'Predicate',
  'SlotProps',
  'StateAction',
  'StateField',
  'StateProjection',
  'Transition',
  'TransitionValue',
  'TabsDataDiagnostic',
  'TabsDataDiagnosticCode',
  'VisibleOrderKind',
  'WindowSplitterDataDiagnostic',
  'WindowSplitterDataDiagnosticCode',
  'WindowSplitterValueData',
  'WindowSplitterValueOptions',
  'WindowSplitterValueRange',
  'WindowSplitterValueState',
])

const rootCoreRuntimeBoundaryExports = new Set([
  'createPatternRuntime',
  'reducePatternData',
])

const rootCoreRuntimeResolverExports = new Set([
  'evaluatePredicate',
  'resolveAriaSource',
  'resolveEventTemplate',
  'resolveKeyToken',
  'resolveNavigationTarget',
  'resolveStateProjection',
  'resolveVisibleOrder',
])

const rootCoreDataHelperExports = new Set([
  'clampWindowSplitterValue',
  'createParentByKey',
  'getTabsDataDiagnostics',
  'getWindowSplitterDataDiagnostics',
  'reduceWindowSplitterValue',
  'resolveWindowSplitterStepValue',
  'resolveWindowSplitterValueRange',
])

const rootCoreExtensionExports = new Set([
  'defineAriaSource',
  'defineDomEvent',
  'defineKeyToken',
  'defineNavigationTarget',
  'definePredicate',
  'defineStateProjection',
  'defineVisibleOrder',
  'isRegisteredAriaSource',
  'isRegisteredNavigationTarget',
  'isRegisteredPredicate',
  'isRegisteredStateProjection',
  'isRegisteredVisibleOrder',
])

const reactComponentExports = new Set([
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
  'Menu',
  'Menubar',
  'MenuButton',
  'Meter',
  'RadioGroup',
  'Slider',
  'Spinbutton',
  'Switch',
  'Table',
  'Tabs',
  'Toolbar',
  'Tooltip',
  'Treegrid',
  'Treeview',
  'WindowSplitter',
])

const reactDataHelperExports = new Set([
  'CommandSurfaceDataOptions',
  'CommandSurfaceItem',
  'createMenuButtonPatternData',
  'createRadioGroupPatternData',
  'createToolbarPatternData',
  'MenuButtonCommandSurfaceDataOptions',
  'ReactMenuButtonTriggerState',
  'ReactToolbarItemKind',
  'SelectableCommandSurfaceDataOptions',
])

const reactOwnerAdapterExports = new Set([
  'AutocompleteListboxActions',
  'AutocompleteListboxOptions',
  'AutocompleteListboxState',
  'AutocompleteOwnerAutocomplete',
  'dispatchAutocompleteOwnerKeyDown',
  'useAutocompleteListbox',
])

const reactStateHelperExports = new Set([
  'PatternStateReducerOptions',
  'PatternStateReducerResult',
  'ReactControlledDialogConfig',
  'ReactControlledDialogOpenChangeMeta',
  'ReactDialogFocusTarget',
  'usePatternStateReducer',
])

if (!existsSync(apiReferencePath)) {
  throw new Error('API.md is required')
}

let apiReference = readFileSync(apiReferencePath, 'utf8')
const interfaceStability = readFileSync(interfaceStabilityPath, 'utf8')
const rootExports = declarationExports('dist/index.d.ts')
const coreExports = declarationExports('dist/core.d.ts')
const reactExports = declarationExports('dist/react.d.ts')
const rootRuntimeExports = await runtimeExports('dist/index.js')
const coreRuntimeExports = await runtimeExports('dist/core.js')
const coreRuntimeModule = await import(new URL('dist/core.js', repoRoot))
const reactRuntimeModule = await import(new URL('dist/react.js', repoRoot))
const reactRuntimeExports = Object.keys(reactRuntimeModule).sort((left, right) => left.localeCompare(right))

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
const rootSurfaceBuckets = assertClassifiedPublicExports('root/core declaration exports', coreExports, classifyRootCoreExport, 'root/core')
const reactSurfaceBuckets = assertClassifiedPublicExports('./react-only declaration exports', reactOnlyExports, classifyReactOnlyExport, 'react-only')
const rootSurfaceManifest = publicSurfaceManifest(coreExports, classifyRootCoreExport)
const reactSurfaceManifest = publicSurfaceManifest(reactOnlyExports, classifyReactOnlyExport)
assertInterfaceStabilityDocumentsBucketPolicies(rootSurfaceBuckets, reactSurfaceBuckets)
assertPublicContractFixture(coreRuntimeModule)
assertPublicPatternFixtures(coreRuntimeModule)
assertPublicReactPatternFixtures(coreRuntimeModule, reactRuntimeModule)
const nextApiReference = shouldWrite
  ? replaceExportBlock(
    replaceExportBlock(
      replaceExportBlock(
        replaceExportBlock(
          replaceExportBlock(
            replaceExportBlock(apiReference, 'root-core-surface', rootSurfaceManifest),
            'react-only-surface',
            reactSurfaceManifest,
          ),
          'root-core',
          coreExports,
        ),
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
assertExportBlock('root-core-surface', rootSurfaceManifest)
assertExportBlock('react-only-surface', reactSurfaceManifest)
assertExportBlock('root-core', coreExports)
assertExportBlock('root-core-runtime', rootRuntimeExports)
assertExportBlock('react-only', reactOnlyExports)
assertExportBlock('react-only-runtime', reactOnlyRuntimeExports)

if (failures.length > 0) {
  console.error(`API reference check failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`${wroteApiReference ? 'Updated API reference and verified' : 'API reference covers'} ${coreExports.length} root/core exports, ${rootRuntimeExports.length} root/core runtime values, ${reactOnlyExports.length} React-only exports, and ${reactOnlyRuntimeExports.length} React-only runtime values. Surface buckets: root/core ${formatBuckets(rootSurfaceBuckets)}; react-only ${formatBuckets(reactSurfaceBuckets)}. Core and React public contract fixtures verified.`)

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

function assertInterfaceStabilityDocumentsBucketPolicies(...bucketMaps) {
  const usedBuckets = new Set(bucketMaps.flatMap((buckets) => [...buckets.keys()]))
  const missingPolicies = [...usedBuckets]
    .filter((bucket) => !surfaceBucketPolicies.has(bucket))
    .sort((left, right) => left.localeCompare(right))

  if (missingPolicies.length > 0) {
    failures.push(`public surface buckets are missing policy metadata: ${missingPolicies.join(', ')}`)
  }

  for (const [bucket, policy] of surfaceBucketPolicies) {
    const row = `| \`${bucket}\` | ${policy.entrypoint} | ${policy.tier} |`
    if (!interfaceStability.includes(row)) {
      failures.push(`INTERFACE_STABILITY.md must document bucket policy row: ${row}`)
    }
  }
}

function assertPublicContractFixture(coreRuntime) {
  if (!existsSync(publicContractFixturePath)) {
    failures.push('scripts/fixtures/public-api-contract.json is required')
    return
  }

  const fixture = JSON.parse(readFileSync(publicContractFixturePath, 'utf8'))
  expectEqual('public contract fixture schemaVersion', fixture.schemaVersion, 1)

  const definitionResult = coreRuntime.PatternDefinitionSchema.safeParse(fixture.definition)
  const dataResult = coreRuntime.PatternDataSchema.safeParse(fixture.data)
  if (!definitionResult.success) failures.push(`public contract PatternDefinition fixture failed schema parse: ${formatSchemaIssues(definitionResult.error)}`)
  if (!dataResult.success) failures.push(`public contract PatternData fixture failed schema parse: ${formatSchemaIssues(dataResult.error)}`)
  if (!definitionResult.success || !dataResult.success) return

  const definition = definitionResult.data
  const data = dataResult.data
  const parsedEvents = []
  for (const [index, event] of fixture.events.entries()) {
    const eventResult = coreRuntime.PatternEventSchema.safeParse(event)
    if (!eventResult.success) {
      failures.push(`public contract PatternEvent fixture ${index} failed schema parse: ${formatSchemaIssues(eventResult.error)}`)
      continue
    }
    parsedEvents.push(eventResult.data)
  }
  expectEqual('public contract event fixture count', parsedEvents.length, 26)

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options: { selectionMode: 'multiple' },
    keyToElementId: (key) => `fixture-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('public contract visible order', runtime.visibleKeys, ['alpha', 'beta', 'gamma'])
  expectDeepEqual('public contract root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-activedescendant', 'aria-multiselectable']), {
    role: 'listbox',
    'aria-label': 'Contract listbox',
    'aria-activedescendant': 'fixture-alpha',
    'aria-multiselectable': true,
  })
  expectEqual('public contract root exposes keyboard handler', typeof runtime.getRootProps().onKeyDown, 'function')

  const alphaProps = runtime.getItemProps('option', 'alpha')
  const gammaProps = runtime.getItemProps('option', 'gamma')
  expectDeepEqual('public contract active option props', pick(alphaProps, ['role', 'id', 'aria-selected', 'tabIndex']), {
    role: 'option',
    id: 'fixture-alpha',
    'aria-selected': true,
    tabIndex: 0,
  })
  expectEqual('public contract active option omits disabled ARIA', Object.hasOwn(alphaProps, 'aria-disabled'), false)
  expectDeepEqual('public contract disabled option props', pick(gammaProps, ['role', 'id', 'aria-selected', 'aria-disabled', 'tabIndex']), {
    role: 'option',
    id: 'fixture-gamma',
    'aria-selected': false,
    'aria-disabled': true,
    tabIndex: -1,
  })
  expectDeepEqual('public contract active item state', runtime.getItemState('alpha', 'option'), {
    active: true,
    selected: true,
    disabled: false,
  })
  expectDeepEqual('public contract disabled item state', runtime.getItemState('gamma', 'option'), {
    active: false,
    selected: false,
    disabled: true,
  })

  const keyboardResult = runtime.resolveKeyboardBinding(keyInput('ArrowDown'), 'alpha')
  expectDeepEqual('public contract keyboard binding result', keyboardResult, {
    preventDefault: true,
    events: [{ type: 'navigate', direction: 'next' }],
  })

  let prevented = false
  runtime.getRootKeyboardHandler()({ ...keyInput('ArrowDown'), preventDefault: () => { prevented = true } })
  expectEqual('public contract root keyboard prevents default', prevented, true)
  expectDeepEqual('public contract root keyboard emits event', enumerableEvent(emitted.at(-1)), { type: 'navigate', direction: 'next' })
  expectEqual('public contract root keyboard emits keyboard reason', emitted.at(-1)?.meta?.reason, 'keyboard')

  runtime.getItemProps('option', 'beta').onClick()
  expectDeepEqual('public contract pointer select event', enumerableEvent(emitted.at(-1)), {
    type: 'select',
    keys: ['beta'],
    anchorKey: 'beta',
    extentKey: 'beta',
  })
  expectEqual('public contract pointer select reason', emitted.at(-1)?.meta?.reason, 'pointer')

  expectEqual('public contract navigate reducer activeKey', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'next' }).state?.activeKey, 'beta')
  expectEqual('public contract transition reducer activeKey', coreRuntime.reducePatternData(definition, data, { type: 'activate', key: 'beta' }).state?.activeKey, 'beta')
  expectDeepEqual('public contract select reducer state', pick(coreRuntime.reducePatternData(definition, data, {
    type: 'select',
    keys: ['beta', 'gamma'],
    anchorKey: 'beta',
    extentKey: 'gamma',
  }).state, ['activeKey', 'selectedKeys', 'anchorKey', 'extentKey']), {
    activeKey: 'gamma',
    selectedKeys: ['beta', 'gamma'],
    anchorKey: 'beta',
    extentKey: 'gamma',
  })
  expectDeepEqual('public contract expand reducer keys', coreRuntime.reducePatternData(definition, data, { type: 'expand', key: 'beta', expanded: true }).state?.expandedKeys, ['alpha', 'beta'])
  expectEqual('public contract check reducer value', coreRuntime.reducePatternData(definition, data, { type: 'check', key: 'beta', checked: true }).state?.checkedByKey?.beta, true)
  expectEqual('public contract press reducer default value', coreRuntime.reducePatternData(definition, data, { type: 'press', key: 'gamma' }).state?.pressedByKey?.gamma, true)
  expectEqual('public contract value reducer value', coreRuntime.reducePatternData(definition, data, { type: 'value', key: 'beta', value: 42 }).state?.valueByKey?.beta, 42)
  expectDeepEqual('public contract focus reducer reason', pick(coreRuntime.reducePatternData(definition, data, {
    type: 'focus',
    key: 'beta',
    meta: { reason: 'focus' },
  }).state, ['activeKey', 'lastEventReason']), { activeKey: 'beta', lastEventReason: 'focus' })
  expectEqual('public contract reducer does not mutate input activeKey', data.state?.activeKey, 'alpha')

  expectSchemaFailure(
    'public contract rejects unknown top-level PatternData fields',
    coreRuntime.PatternDataSchema.safeParse({ ...fixture.data, unexpected: true }),
  )
  expectSchemaFailure(
    'public contract rejects non-JSON item extension values',
    coreRuntime.PatternDataSchema.safeParse({
      ...fixture.data,
      items: {
        ...fixture.data.items,
        alpha: { ...fixture.data.items.alpha, nonJson: Number.POSITIVE_INFINITY },
      },
    }),
  )
  expectSchemaFailure(
    'public contract rejects unknown relation keys',
    coreRuntime.PatternDataSchema.safeParse({
      ...fixture.data,
      relations: { ...fixture.data.relations, rootKeys: ['missing'] },
    }),
  )
  expectSchemaFailure(
    'public contract rejects unknown event fields',
    coreRuntime.PatternEventSchema.safeParse({ type: 'focus', key: 'alpha', extra: true }),
  )
}

function assertPublicPatternFixtures(coreRuntime) {
  if (!existsSync(publicPatternFixturePath)) {
    failures.push('scripts/fixtures/public-pattern-contracts.json is required')
    return
  }

  const fixture = JSON.parse(readFileSync(publicPatternFixturePath, 'utf8'))
  expectEqual('public pattern fixture schemaVersion', fixture.schemaVersion, 1)
  assertTreeviewPatternContract(coreRuntime, fixture.treeview)
  assertGridPatternContract(coreRuntime, fixture.grid)
  assertMenubarPatternContract(coreRuntime, fixture.menubar)
  assertTabsPatternContract(coreRuntime, fixture.tabs)
  assertComboboxPatternContract(coreRuntime, fixture.combobox)
  assertDialogPatternContract(coreRuntime, fixture.dialog)
  assertListboxPatternContract(coreRuntime, fixture.listbox)
  assertMenuButtonPatternContract(coreRuntime, fixture.menuButton)
  assertTreegridPatternContract(coreRuntime, fixture.treegrid)
}

function assertPublicReactPatternFixtures(coreRuntime, reactRuntime) {
  if (!existsSync(publicReactPatternFixturePath)) {
    failures.push('scripts/fixtures/public-react-pattern-contracts.json is required')
    return
  }

  const fixture = JSON.parse(readFileSync(publicReactPatternFixturePath, 'utf8'))
  expectEqual('public React pattern fixture schemaVersion', fixture.schemaVersion, 1)

  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'treeview', fixture.treeview, [
    '<div role="tree" aria-label="Documentation tree" aria-multiselectable="true">',
    'role="treeitem" id="treeitem-docs"',
    'aria-selected="true"',
    'aria-expanded="true"',
    'tabindex="0"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'tabs', fixture.tabs, [
    'role="tablist" aria-label="Documentation tabs" aria-orientation="vertical"',
    'role="tab" id="tab-tab-overview" aria-selected="true" aria-controls="tab-panel-overview" tabindex="0"',
    'role="tabpanel" id="tab-panel-overview" aria-labelledby="tab-tab-overview" tabindex="0"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'combobox', fixture.combobox, [
    'role="combobox"',
    'aria-expanded="false"',
    'aria-haspopup="listbox"',
    'aria-autocomplete="list"',
    'aria-activedescendant="combobox-option-combobox"',
    'aria-controls="combobox-popup"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'dialog', fixture.dialog, [
    'role="button" id="dialog-trigger" aria-haspopup="dialog" aria-expanded="true" aria-controls="dialog-modal"',
    'role="dialog" id="dialog-modal" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"',
    'role="button" id="dialog-cancel"',
    'role="button" id="dialog-submit"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'listbox', fixture.listbox, [
    'role="listbox" aria-label="Number list" aria-multiselectable="true" aria-orientation="vertical" aria-activedescendant="option-one"',
    'role="option" id="option-one" aria-selected="true" aria-posinset="1" aria-setsize="3"',
    'role="option" id="option-three" aria-selected="false" aria-disabled="true" aria-posinset="3" aria-setsize="3"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'menuButton', fixture.menuButton, [
    'role="button" id="mb-trigger" aria-haspopup="menu" aria-expanded="true" aria-controls="mb-menu" aria-label="Actions" tabindex="0"',
    'role="menu" id="mb-menu" aria-labelledby="mb-trigger"',
    'role="menuitem" id="mb-copy" tabindex="0"',
    'role="menuitem" id="mb-paste" aria-disabled="true" tabindex="-1"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'alert', fixture.alert, [
    'role="alert" id="alert-alert" aria-label="Status"',
    'role="button" id="alert-dismiss" aria-label="Dismiss"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'alertDialog', fixture.alertDialog, [
    'role="button" id="ad-trigger" aria-expanded="true" aria-controls="ad-warningDialog" aria-haspopup="dialog"',
    'role="alertdialog" id="ad-warningDialog" aria-modal="true" aria-labelledby="ad-title" aria-describedby="ad-description"',
    'id="ad-title"',
    'id="ad-description"',
    'role="button" id="ad-confirm"',
    'role="button" id="ad-cancel"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'accordion', fixture.accordion, [
    'role="group" aria-label="Sections"',
    'role="button" id="acc-section" aria-expanded="true" aria-controls="acc-panel" tabindex="0"',
    'role="region" id="acc-panel" aria-labelledby="acc-section"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'disclosure', fixture.disclosure, [
    'role="button" id="disc-details" aria-expanded="true" aria-controls="disc-detailsPanel" aria-label="Details"',
    'role="region" id="disc-detailsPanel" aria-labelledby="disc-details"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'button', fixture.button, [
    'id="btn-submit" aria-label="Submit" aria-pressed="true" tabindex="0" type="button"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'checkbox', fixture.checkbox, [
    'role="checkbox" id="chk-agree" aria-label="Agree" aria-checked="mixed" tabindex="0"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'switch', fixture.switch, [
    'role="switch" id="sw-power" aria-label="Power" aria-checked="true" tabindex="0"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'radioGroup', fixture.radioGroup, [
    'role="radiogroup" aria-label="Density"',
    'role="radio" id="radio-compact" aria-checked="false" tabindex="-1"',
    'role="radio" id="radio-comfortable" aria-checked="true" tabindex="0"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'toolbar', fixture.toolbar, [
    'role="toolbar" aria-label="Formatting" aria-orientation="horizontal"',
    'role="button" id="tool-bold" aria-pressed="true" tabindex="0"',
    'role="button" id="tool-italic" aria-pressed="false" tabindex="-1"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'slider', fixture.slider, [
    'role="slider" id="sld-volume" aria-label="Volume" aria-valuemin="0" aria-valuemax="10" aria-valuenow="4" aria-valuetext="4 of 10"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'spinbutton', fixture.spinbutton, [
    'aria-label="Decrement Quantity"',
    'role="spinbutton" id="spin-quantity" aria-label="Quantity" aria-valuemin="0" aria-valuemax="20" aria-valuenow="2"',
    'aria-label="Increment Quantity"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'windowSplitter', fixture.windowSplitter, [
    'id="split-panel"',
    'role="separator" id="split-splitter" aria-label="Resize panel" aria-controls="split-panel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'table', fixture.table, [
    'role="table" aria-label="Metrics" aria-rowcount="1" aria-colcount="2"',
    'role="row" id="tbl-row" aria-rowindex="1"',
    'role="columnheader" id="tbl-name" aria-rowindex="1" aria-colindex="1"',
    'role="cell" id="tbl-value" aria-rowindex="1" aria-colindex="2"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'grid', fixture.grid, [
    'role="grid" aria-label="Editable grid" aria-rowcount="1" aria-colcount="2" aria-multiselectable="true"',
    'role="columnheader" id="grd-name" aria-rowindex="1" aria-colindex="1" aria-selected="true" tabindex="0"',
    'role="gridcell" id="grd-value" aria-rowindex="1" aria-colindex="2" aria-selected="false" tabindex="-1"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'treegrid', fixture.treegrid, [
    'role="treegrid" aria-label="Resources" aria-rowcount="2" aria-colcount="2"',
    'role="row" id="tg-parent" aria-rowindex="1" aria-level="1" aria-expanded="true"',
    'role="gridcell" id="tg-parentName" aria-rowindex="1" aria-colindex="1"',
    'role="row" id="tg-child" aria-rowindex="2" aria-level="2"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'menu', fixture.menu, [
    'role="menu" id="menu-menu" aria-labelledby="menu-menu" tabindex="-1"',
    'role="menuitem" id="menu-copy" tabindex="0"',
    'role="menuitem" id="menu-delete" tabindex="-1"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'menubar', fixture.menubar, [
    'role="menubar" aria-label="Application menu" aria-orientation="horizontal"',
    'role="menuitem" id="menubar-file" aria-haspopup="menu" aria-expanded="true" tabindex="0"',
    'role="menu"',
    'role="menuitem" id="menubar-new"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'link', fixture.link, [
    'role="link" id="lnk-docs" aria-label="Docs" tabindex="0" href="/docs"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'breadcrumb', fixture.breadcrumb, [
    'role="navigation" aria-label="Breadcrumb"',
    'role="list"',
    'role="link" id="bc-home" href="/"',
    'role="link" id="bc-docs" href="/docs"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'meter', fixture.meter, [
    'role="meter" id="meter-usage" aria-label="Usage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="70"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'carousel', fixture.carousel, [
    'role="region" aria-roledescription="carousel" aria-label="Featured"',
    'role="button" id="car-prev" aria-label="Previous"',
    'role="group" id="car-slide1" aria-roledescription="slide"',
    'role="group" id="car-slide2" aria-roledescription="slide" aria-hidden="true"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'feed', fixture.feed, [
    'role="feed" aria-label="Updates"',
    'role="article" id="feed-first" aria-posinset="1" aria-setsize="2" tabindex="0"',
    'role="article" id="feed-second" aria-posinset="2" aria-setsize="2" tabindex="-1"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'landmarks', fixture.landmarks, [
    'role="document"',
    'role="main" id="land-main"',
    'role="navigation" id="land-nav" aria-label="Primary navigation"',
  ])
  assertReactPatternMarkupContract(coreRuntime, reactRuntime, 'tooltip', fixture.tooltip, [
    'role="button" id="tip-help" aria-describedby="tip-tip" aria-label="Help"',
    'role="tooltip" id="tip-tip" aria-labelledby="tip-help"',
  ])
}

function assertReactPatternMarkupContract(coreRuntime, reactRuntime, label, fixture, expectedMarkupParts) {
  const Component = reactRuntime[fixture?.component]
  if (typeof Component !== 'function') {
    failures.push(`public React ${label} fixture component is not exported: ${fixture?.component}`)
    return
  }

  const data = parsePatternDataFixture(coreRuntime, `React ${label}`, fixture)
  const options = parsePatternOptionsFixture(coreRuntime, `React ${label}`, fixture)
  if (!data || !options) return

  const markup = renderToStaticMarkup(createElement(Component, {
    data,
    options,
    onEvent: () => undefined,
  }))

  for (const expected of expectedMarkupParts) {
    if (!markup.includes(expected)) {
      failures.push(`public React ${label} markup must include ${expected}; got ${markup}`)
    }
  }
}

function assertTreeviewPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'treeview', 'treeviewDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'treeview', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'treeview', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `tree-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('treeview visible order', runtime.visibleKeys, ['docs', 'overview', 'api', 'settings'])
  expectDeepEqual('treeview root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-multiselectable']), {
    role: 'tree',
    'aria-label': 'Documentation tree',
    'aria-multiselectable': true,
  })
  expectDeepEqual('treeview expanded active item props', pick(runtime.getItemProps('treeitem', 'docs'), ['role', 'id', 'aria-label', 'aria-selected', 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize', 'tabIndex']), {
    role: 'treeitem',
    id: 'tree-docs',
    'aria-label': 'Docs',
    'aria-selected': false,
    'aria-expanded': true,
    'aria-level': 1,
    'aria-posinset': 1,
    'aria-setsize': 2,
    tabIndex: 0,
  })
  expectDeepEqual('treeview selected child state', pick(runtime.getItemState('overview', 'treeitem'), ['active', 'selected', 'disabled', 'expanded']), {
    active: false,
    selected: true,
    disabled: false,
    expanded: false,
  })
  expectDeepEqual('treeview ArrowRight on expanded parent', runtime.resolveKeyboardBinding(keyInput('ArrowRight'), 'docs'), {
    preventDefault: true,
    events: [{ type: 'navigate', direction: 'child' }],
  })
  expectDeepEqual('treeview ArrowLeft on expanded parent', runtime.resolveKeyboardBinding(keyInput('ArrowLeft'), 'docs'), {
    preventDefault: true,
    events: [{ type: 'expand', key: 'docs', expanded: false }],
  })
  expectEqual('treeview child navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'child' }).state?.activeKey, 'overview')
  expectDeepEqual('treeview collapse reducer', coreRuntime.reducePatternData(definition, data, { type: 'expand', key: 'docs', expanded: false }).state?.expandedKeys, [])

  runtime.getItemProps('treeitem', 'api').onClick()
  expectDeepEqual('treeview click emits focus and select', emitted.map(enumerableEvent), [
    { type: 'focus', key: 'api' },
    { type: 'select', keys: ['api'], anchorKey: 'api', extentKey: 'api' },
  ])
  expectDeepEqual('treeview click event reasons', emitted.map((event) => event.meta?.reason), ['pointer', 'pointer'])
}

function assertGridPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'grid', 'gridDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'grid', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'grid', fixture)
  if (!definition || !data || !options) return

  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `grid-${key}`,
    onEvent: () => {},
  })

  expectDeepEqual('grid visible order', runtime.visibleKeys, ['r1-name', 'r1-status', 'r2-name', 'r2-status'])
  expectDeepEqual('grid root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-rowcount', 'aria-colcount', 'aria-multiselectable']), {
    role: 'grid',
    'aria-label': 'Status grid',
    'aria-rowcount': 2,
    'aria-colcount': 2,
    'aria-multiselectable': true,
  })
  expectDeepEqual('grid active cell props', pick(runtime.getItemProps('gridcell', 'r1-name'), ['role', 'id', 'aria-rowindex', 'aria-colindex', 'aria-selected', 'tabIndex']), {
    role: 'gridcell',
    id: 'grid-r1-name',
    'aria-rowindex': 1,
    'aria-colindex': 1,
    'aria-selected': true,
    tabIndex: 0,
  })
  expectDeepEqual('grid inactive cell props', pick(runtime.getItemProps('gridcell', 'r2-status'), ['role', 'id', 'aria-rowindex', 'aria-colindex', 'aria-selected', 'tabIndex']), {
    role: 'gridcell',
    id: 'grid-r2-status',
    'aria-rowindex': 2,
    'aria-colindex': 2,
    'aria-selected': false,
    tabIndex: -1,
  })
  expectDeepEqual('grid Shift+ArrowRight binding', runtime.resolveKeyboardBinding(keyInput('ArrowRight', { shiftKey: true }), 'r1-name'), {
    preventDefault: true,
    events: [{ type: 'extendSelection', direction: 'right' }],
  })
  expectEqual('grid right navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'right' }).state?.activeKey, 'r1-status')
  expectDeepEqual('grid extend selection reducer', pick(coreRuntime.reducePatternData(definition, data, { type: 'extendSelection', direction: 'right' }).state, ['activeKey', 'selectedKeys', 'anchorKey', 'extentKey']), {
    activeKey: 'r1-status',
    selectedKeys: ['r1-name', 'r1-status'],
    anchorKey: 'r1-name',
    extentKey: 'r1-status',
  })
  expectDeepEqual('grid editStart transition reducer', pick(coreRuntime.reducePatternData(definition, data, { type: 'editStart', key: 'r1-name', value: 'draft' }).state, ['editingKey', 'editDraftByKey']), {
    editingKey: 'r1-name',
    editDraftByKey: { 'r1-name': 'draft' },
  })
}

function assertMenubarPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'menubar', 'menubarDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'menubar', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'menubar', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `menu-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('menubar visible order', runtime.visibleKeys, ['file', 'edit', 'view'])
  expectDeepEqual('menubar root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-orientation']), {
    role: 'menubar',
    'aria-label': 'Application menu',
    'aria-orientation': 'horizontal',
  })
  expectDeepEqual('menubar submenu owner props', pick(runtime.getItemProps('menuitem', 'file'), ['role', 'id', 'aria-haspopup', 'aria-expanded', 'tabIndex']), {
    role: 'menuitem',
    id: 'menu-file',
    'aria-haspopup': 'menu',
    'aria-expanded': false,
    tabIndex: 0,
  })
  expectDeepEqual('menubar disabled item props', pick(runtime.getItemProps('menuitem', 'edit'), ['role', 'id', 'aria-disabled', 'tabIndex']), {
    role: 'menuitem',
    id: 'menu-edit',
    'aria-disabled': true,
    tabIndex: -1,
  })
  expectDeepEqual('menubar ArrowDown opens child menu', runtime.resolveKeyboardBinding(keyInput('ArrowDown'), 'file'), {
    preventDefault: true,
    events: [
      { type: 'expand', key: 'file', expanded: true },
      { type: 'navigate', direction: 'down' },
    ],
  })
  expectEqual('menubar next navigation skips disabled item', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'next' }).state?.activeKey, 'view')
  expectEqual('menubar child navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'down' }).state?.activeKey, 'new')
  expectDeepEqual('menubar expand reducer', coreRuntime.reducePatternData(definition, data, { type: 'expand', key: 'file', expanded: true }).state?.expandedKeys, ['file'])

  runtime.getItemProps('menuitem', 'file').onClick()
  expectDeepEqual('menubar active click emits activate only', emitted.map(enumerableEvent), [{ type: 'activate', key: 'file' }])
  expectDeepEqual('menubar active click reason', emitted.map((event) => event.meta?.reason), ['pointer'])
}

function assertTabsPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'tabs', 'tabsDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'tabs', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'tabs', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `tabs-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('tabs visible order', runtime.visibleKeys, ['tab-overview', 'tab-api'])
  expectDeepEqual('tabs root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-orientation']), {
    role: 'tablist',
    'aria-label': 'Documentation tabs',
    'aria-orientation': 'vertical',
  })
  expectDeepEqual('tabs active tab props', pick(runtime.getItemProps('tab', 'tab-overview'), ['role', 'id', 'aria-selected', 'aria-controls', 'tabIndex']), {
    role: 'tab',
    id: 'tabs-tab-overview',
    'aria-selected': true,
    'aria-controls': 'tabs-panel-overview',
    tabIndex: 0,
  })
  expectDeepEqual('tabs panel props', pick(runtime.getItemProps('tabpanel', 'panel-api'), ['role', 'id', 'aria-labelledby', 'tabIndex']), {
    role: 'tabpanel',
    id: 'tabs-panel-api',
    'aria-labelledby': 'tabs-tab-api',
    tabIndex: 0,
  })
  expectDeepEqual('tabs vertical ArrowDown binding', runtime.resolveKeyboardBinding(keyInput('ArrowDown'), 'tab-overview'), {
    preventDefault: true,
    events: [{ type: 'navigate', direction: 'next' }],
  })
  expectDeepEqual('tabs Delete binding', runtime.resolveKeyboardBinding(keyInput('Delete'), 'tab-overview'), {
    preventDefault: true,
    events: [{ type: 'close', key: 'tab-overview' }],
  })
  expectEqual('tabs next navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'next' }).state?.activeKey, 'tab-api')
  expectDeepEqual('tabs select reducer', pick(coreRuntime.reducePatternData(definition, data, { type: 'select', keys: ['tab-api'], anchorKey: 'tab-api', extentKey: 'tab-api' }).state, ['activeKey', 'selectedKeys']), {
    activeKey: 'tab-api',
    selectedKeys: ['tab-api'],
  })
  runtime.getItemProps('tab', 'tab-api').onFocus()
  expectDeepEqual('tabs automatic focus emits focus and select', emitted.map(enumerableEvent), [
    { type: 'focus', key: 'tab-api' },
    { type: 'select', keys: ['tab-api'], anchorKey: 'tab-api', extentKey: 'tab-api' },
  ])
  expectDeepEqual('tabs automatic focus reasons', emitted.map((event) => event.meta?.reason), ['focus', 'focus'])
}

function assertComboboxPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'combobox', 'comboboxDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'combobox', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'combobox', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `combo-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('combobox visible order', runtime.visibleKeys, ['alpha', 'beta'])
  expectDeepEqual('combobox root props', pick(runtime.getRootProps(), ['role', 'aria-expanded', 'aria-haspopup', 'aria-autocomplete', 'aria-activedescendant', 'aria-label']), {
    role: 'combobox',
    'aria-expanded': false,
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    'aria-activedescendant': 'combo-combobox',
    'aria-label': 'Search options',
  })
  expectDeepEqual('combobox option props', pick(runtime.getItemProps('option', 'alpha'), ['role', 'id', 'aria-selected']), {
    role: 'option',
    id: 'combo-alpha',
    'aria-selected': false,
  })
  expectDeepEqual('combobox ArrowDown opens popup', runtime.resolveKeyboardBinding(keyInput('ArrowDown'), 'combobox'), {
    preventDefault: true,
    events: [
      { type: 'expand', key: 'combobox', expanded: true },
      { type: 'navigate', direction: 'first' },
    ],
  })
  expectDeepEqual('combobox Enter selects and closes when open', coreRuntime.createPatternRuntime({
    definition,
    data: { ...data, state: { ...data.state, activeKey: 'alpha', expandedKeys: ['combobox'] } },
    options,
    keyToElementId: (key) => `combo-${key}`,
    onEvent: () => {},
  }).resolveKeyboardBinding(keyInput('Enter'), 'alpha'), {
    preventDefault: true,
    events: [
      { type: 'select', keys: ['alpha'], anchorKey: 'alpha', extentKey: 'alpha' },
      { type: 'expand', key: 'combobox', expanded: false },
    ],
  })
  expectDeepEqual('combobox open reducer', coreRuntime.reducePatternData(definition, data, { type: 'expand', key: 'combobox', expanded: true }).state?.expandedKeys, ['combobox'])
  expectEqual('combobox first option reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'first' }).state?.activeKey, 'alpha')

  runtime.getRootProps().onInput()
  expectDeepEqual('combobox input emits inputValue', enumerableEvent(emitted.at(-1)), { type: 'inputValue', key: 'combobox', value: '' })
  expectEqual('combobox input reason', emitted.at(-1)?.meta?.reason, 'keyboard')
}

function assertDialogPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'dialog', 'dialogDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'dialog', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'dialog', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `dialog-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('dialog root props', pick(runtime.getRootProps(), ['role', 'aria-modal']), {
    role: 'dialog',
    'aria-modal': true,
  })
  expectDeepEqual('dialog trigger props', pick(runtime.getItemProps('trigger', 'trigger'), ['role', 'id', 'aria-haspopup', 'aria-expanded', 'aria-controls']), {
    role: 'button',
    id: 'dialog-trigger',
    'aria-haspopup': 'dialog',
    'aria-expanded': true,
    'aria-controls': 'dialog-modal',
  })
  expectDeepEqual('dialog keyed dialog props', pick(runtime.getItemProps('dialog', 'modal'), ['role', 'id', 'aria-modal', 'aria-labelledby', 'aria-describedby']), {
    role: 'dialog',
    id: 'dialog-modal',
    'aria-modal': true,
    'aria-labelledby': 'dialog-title',
    'aria-describedby': 'dialog-description',
  })
  expectDeepEqual('dialog Escape closes trigger', runtime.resolveKeyboardBinding(keyInput('Escape'), 'trigger'), {
    preventDefault: true,
    events: [{ type: 'expand', key: 'trigger', expanded: false }],
  })
  expectDeepEqual('dialog close reducer', pick(coreRuntime.reducePatternData(definition, data, { type: 'expand', key: 'trigger', expanded: false }).state, ['activeKey', 'expandedKeys']), {
    activeKey: 'trigger',
    expandedKeys: [],
  })
  runtime.getItemProps('overlay', 'modal').onMouseDown()
  expectDeepEqual('dialog overlay emits close', enumerableEvent(emitted.at(-1)), { type: 'expand', key: 'trigger', expanded: false })
  expectEqual('dialog overlay close reason', emitted.at(-1)?.meta?.reason, 'pointer')
}

function assertListboxPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'listbox', 'listboxDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'listbox', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'listbox', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `list-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('listbox visible order', runtime.visibleKeys, ['one', 'two', 'three'])
  expectDeepEqual('listbox root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-multiselectable', 'aria-orientation', 'aria-activedescendant']), {
    role: 'listbox',
    'aria-label': 'Number list',
    'aria-multiselectable': true,
    'aria-orientation': 'vertical',
    'aria-activedescendant': 'list-one',
  })
  expectDeepEqual('listbox selected option props', pick(runtime.getItemProps('option', 'one'), ['role', 'id', 'aria-selected', 'aria-posinset', 'aria-setsize']), {
    role: 'option',
    id: 'list-one',
    'aria-selected': true,
    'aria-posinset': 1,
    'aria-setsize': 3,
  })
  expectDeepEqual('listbox disabled option props', pick(runtime.getItemProps('option', 'three'), ['role', 'id', 'aria-selected', 'aria-disabled', 'aria-posinset', 'aria-setsize']), {
    role: 'option',
    id: 'list-three',
    'aria-selected': false,
    'aria-disabled': true,
    'aria-posinset': 3,
    'aria-setsize': 3,
  })
  expectDeepEqual('listbox ArrowDown binding', runtime.resolveKeyboardBinding(keyInput('ArrowDown'), 'one'), {
    preventDefault: true,
    events: [{ type: 'navigate', direction: 'next' }],
  })
  expectEqual('listbox next navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'next' }).state?.activeKey, 'two')
  runtime.getItemProps('option', 'two').onFocus()
  expectDeepEqual('listbox followFocus emits focus and select', emitted.map(enumerableEvent), [
    { type: 'focus', key: 'two' },
    { type: 'select', keys: ['two'], anchorKey: 'two', extentKey: 'two' },
  ])
  expectDeepEqual('listbox followFocus reasons', emitted.map((event) => event.meta?.reason), ['focus', 'focus'])
}

function assertMenuButtonPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'menuButton', 'menuButtonDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'menuButton', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'menuButton', fixture)
  if (!definition || !data || !options) return

  const emitted = []
  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `mb-${key}`,
    onEvent: (event) => emitted.push(event),
  })

  expectDeepEqual('menuButton visible order', runtime.visibleKeys, ['copy', 'paste', 'delete'])
  expectDeepEqual('menuButton trigger props', pick(runtime.getItemProps('trigger', 'trigger'), ['role', 'id', 'aria-haspopup', 'aria-expanded', 'aria-controls', 'aria-label', 'tabIndex']), {
    role: 'button',
    id: 'mb-trigger',
    'aria-haspopup': 'menu',
    'aria-expanded': true,
    'aria-controls': 'mb-menu',
    'aria-label': 'Actions',
    tabIndex: 0,
  })
  expectDeepEqual('menuButton menu props', pick(runtime.getItemProps('menu', 'menu'), ['role', 'id', 'aria-labelledby']), {
    role: 'menu',
    id: 'mb-menu',
    'aria-labelledby': 'mb-trigger',
  })
  expectDeepEqual('menuButton disabled item props', pick(runtime.getItemProps('menuitem', 'paste'), ['role', 'id', 'aria-disabled', 'tabIndex']), {
    role: 'menuitem',
    id: 'mb-paste',
    'aria-disabled': true,
    tabIndex: -1,
  })
  expectDeepEqual('menuButton Enter activates and dismisses', runtime.resolveKeyboardBinding(keyInput('Enter'), 'copy'), {
    preventDefault: true,
    events: [
      { type: 'activate', key: 'copy' },
      { type: 'dismiss' },
    ],
  })
  runtime.getItemProps('trigger', 'trigger').onClick()
  expectDeepEqual('menuButton trigger click closes when expanded', enumerableEvent(emitted.at(-1)), { type: 'expand', key: 'trigger', expanded: false })
  expectEqual('menuButton trigger click reason', emitted.at(-1)?.meta?.reason, 'pointer')
  runtime.getItemProps('menuitem', 'copy').onClick()
  expectDeepEqual('menuButton item click activates', enumerableEvent(emitted.at(-1)), { type: 'activate', key: 'copy' })
}

function assertTreegridPatternContract(coreRuntime, fixture) {
  const definition = parsePatternDefinitionExport(coreRuntime, 'treegrid', 'treegridDefinition')
  const data = parsePatternDataFixture(coreRuntime, 'treegrid', fixture)
  const options = parsePatternOptionsFixture(coreRuntime, 'treegrid', fixture)
  if (!definition || !data || !options) return

  const runtime = coreRuntime.createPatternRuntime({
    definition,
    data,
    options,
    keyToElementId: (key) => `tg-${key}`,
    onEvent: () => {},
  })

  expectDeepEqual('treegrid visible order', runtime.visibleKeys, ['parent-name', 'parent-status', 'child-name', 'child-status', 'sibling-name', 'sibling-status'])
  expectDeepEqual('treegrid root props', pick(runtime.getRootProps(), ['role', 'aria-label', 'aria-rowcount', 'aria-colcount', 'aria-multiselectable']), {
    role: 'treegrid',
    'aria-label': 'Resource treegrid',
    'aria-rowcount': 3,
    'aria-colcount': 2,
    'aria-multiselectable': true,
  })
  expectDeepEqual('treegrid parent row props', pick(runtime.getItemProps('row', 'parent'), ['role', 'id', 'aria-rowindex', 'aria-level', 'aria-expanded']), {
    role: 'row',
    id: 'tg-parent',
    'aria-rowindex': 1,
    'aria-level': 1,
    'aria-expanded': true,
  })
  expectDeepEqual('treegrid active cell props', pick(runtime.getItemProps('gridcell', 'parent-name'), ['role', 'id', 'aria-rowindex', 'aria-colindex', 'aria-selected', 'tabIndex']), {
    role: 'gridcell',
    id: 'tg-parent-name',
    'aria-rowindex': 1,
    'aria-colindex': 1,
    'aria-selected': true,
    tabIndex: 0,
  })
  expectDeepEqual('treegrid ArrowLeft collapses parent row from first cell', runtime.resolveKeyboardBinding(keyInput('ArrowLeft'), 'parent-name'), {
    preventDefault: true,
    events: [{ type: 'expandActiveRow', expanded: false }],
  })
  expectEqual('treegrid right navigation reducer', coreRuntime.reducePatternData(definition, data, { type: 'navigate', direction: 'right' }).state?.activeKey, 'parent-status')
  expectDeepEqual('treegrid collapse active row reducer', coreRuntime.reducePatternData(definition, data, { type: 'expandActiveRow', expanded: false }).state?.expandedKeys, [])
  expectDeepEqual('treegrid row selection reducer', pick(coreRuntime.reducePatternData(definition, data, { type: 'selectRow' }).state, ['selectedKeys', 'anchorKey', 'extentKey']), {
    selectedKeys: ['parent-name', 'parent-status'],
    anchorKey: 'parent-name',
    extentKey: 'parent-status',
  })
}

function parsePatternDefinitionExport(coreRuntime, label, exportName) {
  const definition = coreRuntime[exportName]
  if (!definition) {
    failures.push(`${label} public pattern contract missing ${exportName}`)
    return null
  }
  const result = coreRuntime.PatternDefinitionSchema.safeParse(definition)
  if (!result.success) {
    failures.push(`${label} public definition failed schema parse: ${formatSchemaIssues(result.error)}`)
    return null
  }
  return result.data
}

function parsePatternDataFixture(coreRuntime, label, fixture) {
  const result = coreRuntime.PatternDataSchema.safeParse(fixture?.data)
  if (!result.success) {
    failures.push(`${label} public pattern data failed schema parse: ${formatSchemaIssues(result.error)}`)
    return null
  }
  return result.data
}

function parsePatternOptionsFixture(coreRuntime, label, fixture) {
  const result = coreRuntime.PatternOptionsSchema.safeParse(fixture?.options ?? {})
  if (!result.success) {
    failures.push(`${label} public pattern options failed schema parse: ${formatSchemaIssues(result.error)}`)
    return null
  }
  return result.data
}

function keyInput(key, modifiers = {}) {
  return { key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, ...modifiers }
}

function enumerableEvent(event) {
  return event ? { ...event } : event
}

function pick(value, keys) {
  const source = value ?? {}
  return Object.fromEntries(keys.filter((key) => Object.hasOwn(source, key)).map((key) => [key, source[key]]))
}

function expectSchemaFailure(label, result) {
  if (result.success) failures.push(`${label}: expected schema failure`)
}

function expectEqual(label, actual, expected) {
  try {
    assert.equal(actual, expected)
  } catch (error) {
    failures.push(`${label}: ${error.message}`)
  }
}

function expectDeepEqual(label, actual, expected) {
  try {
    assert.deepEqual(actual, expected)
  } catch (error) {
    failures.push(`${label}: ${error.message}`)
  }
}

function formatSchemaIssues(error) {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
    .join('; ')
}

function assertClassifiedPublicExports(label, exports, classify, entrypoint) {
  const buckets = new Map()
  const unclassified = []
  const invalidEntrypoints = []
  const missingPolicies = []

  for (const name of exports) {
    const bucket = classify(name)
    if (!bucket) {
      unclassified.push(name)
      continue
    }
    const policy = surfaceBucketPolicies.get(bucket)
    if (!policy) {
      missingPolicies.push(`${name} -> ${bucket}`)
      continue
    }
    if (policy.entrypoint !== entrypoint) {
      invalidEntrypoints.push(`${name} -> ${bucket} (${policy.entrypoint})`)
      continue
    }
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1)
  }

  if (unclassified.length > 0) {
    failures.push(`${label} contains unclassified public exports: ${unclassified.join(', ')}`)
  }
  if (missingPolicies.length > 0) {
    failures.push(`${label} contains public exports with unknown bucket policies: ${missingPolicies.join(', ')}`)
  }
  if (invalidEntrypoints.length > 0) {
    failures.push(`${label} contains public exports in buckets not allowed for ${entrypoint}: ${invalidEntrypoints.join(', ')}`)
  }

  return buckets
}

function publicSurfaceManifest(exports, classify) {
  return exports.map((name) => {
    const bucket = classify(name) ?? 'unclassified'
    const tier = surfaceBucketPolicies.get(bucket)?.tier ?? 'unclassified'
    return `${name} | ${bucket} | ${tier}`
  })
}

function classifyRootCoreExport(name) {
  if (/^[a-z][A-Za-z0-9]*Definition$/.test(name)) return 'apg-pattern-definition'
  if (name.endsWith('Schema')) return 'schema-validator'
  if (name.endsWith('Resolver')) return 'extension-resolver-type'
  if (rootCoreContractTypes.has(name)) return 'core-contract-type'
  if (rootCoreRuntimeBoundaryExports.has(name)) return 'runtime-boundary'
  if (rootCoreRuntimeResolverExports.has(name)) return 'runtime-resolver'
  if (rootCoreDataHelperExports.has(name)) return 'core-data-helper'
  if (rootCoreExtensionExports.has(name)) return 'extension-vocabulary'
  return null
}

function classifyReactOnlyExport(name) {
  if (reactComponentExports.has(name)) return 'react-preset-component'
  if (reactComponentExports.has(name.replace(/Props$/, ''))) return 'react-preset-props'
  if (reactDataHelperExports.has(name)) return 'react-data-helper'
  if (reactOwnerAdapterExports.has(name)) return 'react-owner-adapter'
  if (reactStateHelperExports.has(name)) return 'react-state-helper'
  if (/^use[A-Z][A-Za-z0-9]*Pattern$/.test(name)) return 'react-pattern-hook'
  if (/^React[A-Z][A-Za-z0-9]*(Runtime|Options)$/.test(name)) return 'react-runtime-type'
  if (/^React[A-Z][A-Za-z0-9]*(RenderItem|Item|Slide|Article|Cell|Row|Option)$/.test(name)) return 'react-render-surface-type'
  return null
}

function formatBuckets(buckets) {
  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, count]) => `${name}:${count}`)
    .join(', ')
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
