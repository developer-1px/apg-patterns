import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repoRoot = new URL('../', import.meta.url)
const apiReferencePath = new URL('API.md', repoRoot)
const interfaceStabilityPath = new URL('INTERFACE_STABILITY.md', repoRoot)
const publicContractFixturePath = new URL('scripts/fixtures/public-api-contract.json', repoRoot)
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
const reactRuntimeExports = await runtimeExports('dist/react.js')
const coreRuntimeModule = await import(new URL('dist/core.js', repoRoot))

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

console.log(`${wroteApiReference ? 'Updated API reference and verified' : 'API reference covers'} ${coreExports.length} root/core exports, ${rootRuntimeExports.length} root/core runtime values, ${reactOnlyExports.length} React-only exports, and ${reactOnlyRuntimeExports.length} React-only runtime values. Surface buckets: root/core ${formatBuckets(rootSurfaceBuckets)}; react-only ${formatBuckets(reactSurfaceBuckets)}. Public contract fixture verified.`)

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

function keyInput(key) {
  return { key, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false }
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
