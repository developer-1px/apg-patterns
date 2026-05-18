import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const outDir = new URL('../docs/bugs/', import.meta.url)

const reports = [
  ...[
    ['accordion', 'src/patterns/accordion/useAccordionPattern.ts', 11, 'Default elementIdPrefix is shared across all accordion instances', 'Rendering two accordions without overriding options.elementIdPrefix produces duplicate header and panel ids.'],
    ['alert', 'src/patterns/alert/useAlertPattern.ts', 38, 'Default elementIdPrefix is shared across all alert instances', 'Rendering two alerts with the same item keys produces duplicate ids for alert content and dismiss controls.'],
    ['alertdialog', 'src/patterns/alertdialog/useAlertDialogPattern.ts', 24, 'Default elementIdPrefix is shared across all alertdialog instances', 'Two alert dialogs on one page both emit ids such as alertdialog-title and alertdialog-description.'],
    ['breadcrumb', 'src/patterns/breadcrumb/useBreadcrumbPattern.ts', 35, 'Default elementIdPrefix is shared across breadcrumb instances', 'Two breadcrumb patterns with matching item keys produce duplicate link ids.'],
    ['button', 'src/patterns/button/useButtonPattern.ts', 35, 'Default elementIdPrefix is shared across button instances', 'Multiple button pattern instances with the same key produce duplicate button ids.'],
    ['carousel', 'src/patterns/carousel/useCarouselPattern.ts', 46, 'Default elementIdPrefix is shared across carousel instances', 'Two carousels with the same slide keys emit duplicate slide and control ids.'],
    ['checkbox', 'src/patterns/checkbox/useCheckboxPattern.ts', 34, 'Default elementIdPrefix is shared across checkbox instances', 'Multiple checkbox groups with the same keys emit duplicate checkbox ids.'],
    ['combobox', 'src/patterns/combobox/useComboboxPattern.ts', 30, 'Default elementIdPrefix is shared across combobox instances', 'Two comboboxes with the same option keys emit duplicate option ids used by aria-activedescendant.'],
    ['dialog', 'src/patterns/dialog/dialogRuntimeKeys.ts', 4, 'Dialog panel id ignores elementIdPrefix', 'Every dialog instance uses dialog-panel for the dialog item, so two open dialogs produce duplicate dialog-panel ids.'],
    ['disclosure', 'src/patterns/disclosure/useDisclosurePattern.ts', 32, 'Default elementIdPrefix is shared across disclosure instances', 'Two disclosure groups with the same keys emit duplicate trigger and panel ids.'],
    ['feed', 'src/patterns/feed/useFeedPattern.ts', 25, 'Default elementIdPrefix is shared across feed instances', 'Two feeds with the same article keys emit duplicate article ids.'],
    ['grid', 'src/patterns/grid/useGridPattern.ts', 39, 'Default elementIdPrefix is shared across grid instances', 'Two grids with the same cell keys emit duplicate gridcell ids.'],
    ['link', 'src/patterns/link/useLinkPattern.ts', 41, 'Default elementIdPrefix is shared across link instances', 'Multiple link pattern instances with the same key emit duplicate link ids.'],
    ['listbox', 'src/patterns/listbox/useListboxPattern.ts', 18, 'Default elementIdPrefix is shared across listbox instances', 'Two listboxes with matching option keys emit duplicate option ids.'],
    ['menu-button', 'src/patterns/menu/useMenuButtonPattern.ts', 33, 'Default elementIdPrefix is shared across menu button instances', 'Two menu buttons with the same trigger/menu item keys emit duplicate ids used by aria-controls and aria-activedescendant.'],
    ['menubar', 'src/patterns/menu/useMenubarPattern.ts', 29, 'Default elementIdPrefix is shared across menubar instances', 'Two menubars with the same item keys emit duplicate menuitem ids.'],
    ['meter', 'src/patterns/meter/useMeterPattern.ts', 27, 'Default elementIdPrefix is shared across meter instances', 'Two meter patterns with the same item key emit duplicate meter ids.'],
    ['radio', 'src/patterns/radio/useRadioGroupPattern.ts', 36, 'Default elementIdPrefix is shared across radio group instances', 'Two radio groups with the same option keys emit duplicate radio ids.'],
    ['slider', 'src/patterns/slider/useSliderPattern.ts', 32, 'Default elementIdPrefix is shared across slider instances', 'Two sliders with the same thumb keys emit duplicate slider ids.'],
    ['spinbutton', 'src/patterns/spinbutton/useSpinbuttonPattern.ts', 29, 'Default elementIdPrefix is shared across spinbutton instances', 'Two spinbuttons with the same item key emit duplicate spinbutton ids.'],
    ['switch', 'src/patterns/switch/useSwitchPattern.ts', 34, 'Default elementIdPrefix is shared across switch instances', 'Two switch pattern instances with the same key emit duplicate switch ids.'],
    ['table', 'src/patterns/table/useTablePattern.ts', 34, 'Default elementIdPrefix is shared across table instances', 'Two tables with matching cell keys emit duplicate table cell ids.'],
    ['tabs', 'src/patterns/tabs/useTabsPattern.ts', 21, 'Default elementIdPrefix is shared across tabs instances', 'Two tablists with matching tab keys emit duplicate tab and tabpanel ids.'],
    ['toolbar', 'src/patterns/toolbar/useToolbarPattern.ts', 36, 'Default elementIdPrefix is shared across toolbar instances', 'Two toolbars with the same item keys emit duplicate toolbar item ids.'],
    ['treegrid', 'src/patterns/treegrid/useTreegridPattern.ts', 30, 'Default elementIdPrefix is shared across treegrid instances', 'Two treegrids with matching row/cell keys emit duplicate treegrid cell ids.'],
    ['treeview', 'src/patterns/treeview/runtime.ts', 47, 'Default elementIdPrefix is shared across treeview instances', 'Two treeviews with matching node keys emit duplicate treeitem ids.'],
    ['windowsplitter', 'src/patterns/windowsplitter/useWindowSplitterPattern.ts', 33, 'Default elementIdPrefix is shared across window splitter instances', 'Two splitters with the same item keys emit duplicate separator/pane ids.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'duplicate-id', fix: 'Use React useId or require a per-instance id namespace in the runtime default path.' })),

  ...[
    ['alertdialog', 'src/patterns/alertdialog/useAlertDialogPattern.ts', 24],
    ['breadcrumb', 'src/patterns/breadcrumb/useBreadcrumbPattern.ts', 35],
    ['button', 'src/patterns/button/useButtonPattern.ts', 35],
    ['carousel', 'src/patterns/carousel/useCarouselPattern.ts', 46],
    ['checkbox', 'src/patterns/checkbox/useCheckboxPattern.ts', 34],
    ['combobox', 'src/patterns/combobox/useComboboxPattern.ts', 30],
    ['feed', 'src/patterns/feed/useFeedPattern.ts', 25],
    ['grid', 'src/patterns/grid/useGridPattern.ts', 39],
    ['link', 'src/patterns/link/useLinkPattern.ts', 41],
    ['listbox', 'src/patterns/listbox/useListboxPattern.ts', 18],
    ['menu-button', 'src/patterns/menu/useMenuButtonPattern.ts', 33],
    ['menubar', 'src/patterns/menu/useMenubarPattern.ts', 29],
    ['meter', 'src/patterns/meter/useMeterPattern.ts', 27],
    ['radio', 'src/patterns/radio/useRadioGroupPattern.ts', 36],
    ['slider', 'src/patterns/slider/useSliderPattern.ts', 32],
    ['spinbutton', 'src/patterns/spinbutton/useSpinbuttonPattern.ts', 29],
    ['switch', 'src/patterns/switch/useSwitchPattern.ts', 34],
    ['table', 'src/patterns/table/useTablePattern.ts', 34],
    ['tabs', 'src/patterns/tabs/runtime.ts', 67],
    ['toolbar', 'src/patterns/toolbar/useToolbarPattern.ts', 36],
    ['treegrid', 'src/patterns/treegrid/useTreegridPattern.ts', 30],
    ['treeview', 'src/patterns/treeview/runtime.ts', 47],
    ['windowsplitter', 'src/patterns/windowsplitter/useWindowSplitterPattern.ts', 33],
  ].map(([id, file, line]) => ({
    id,
    file,
    line,
    title: `${id} ids interpolate raw item keys`,
    impact: 'Pattern data accepts string keys, but this id builder inserts the key directly. Keys containing spaces, punctuation, slashes, or repeated normalized forms can create brittle id references and broken CSS/test selectors.',
    category: 'raw-key-id',
    fix: 'Normalize and collision-check generated ids, or expose a central id encoder used by every pattern.',
  })),

  ...[
    ['accordion', 'src/patterns/accordion/useAccordionPattern.ts', 20],
    ['alertdialog', 'src/patterns/alertdialog/useAlertDialogPattern.ts', 27],
    ['dialog', 'src/patterns/dialog/useDialogPattern.ts', 30],
    ['feed', 'src/patterns/feed/useFeedPattern.ts', 28],
    ['grid', 'src/patterns/grid/useGridPattern.ts', 42],
    ['menu-button', 'src/patterns/menu/useMenuButtonPattern.ts', 36],
    ['menubar', 'src/patterns/menu/useMenubarPattern.ts', 35],
    ['treegrid', 'src/patterns/treegrid/useTreegridPattern.ts', 33],
    ['treeview', 'src/patterns/treeview/useTreeviewPattern.ts', 21],
  ].map(([id, file, line]) => ({
    id,
    file,
    line,
    title: `${id} effect dependency changes every render`,
    impact: 'The id resolver is recreated during render and then passed into usePatternEffects. Because the function identity changes, effects can rerun on unrelated renders, causing duplicate focus/restore work.',
    category: 'unstable-effect-dependency',
    fix: 'Memoize the id resolver with useCallback/useMemo or move it outside render when options are stable.',
  })),

  ...[
    ['accordion-demo', 'demo/src/patterns/accordion/Accordion.test.tsx', 57, 'Accordion keyboard tests emit React act warnings', 'The test suite logs act warnings for Enter, Space, Arrow, Home, and End flows, so assertions may observe intermediate UI instead of committed user-visible state.'],
    ['tabs-demo', 'demo/src/patterns/tabs/Tabs.test.tsx', 61, 'Tabs keyboard tests emit React act warnings', 'Automatic, manual, and vertical tab keyboard tests update state outside act, which can hide timing regressions.'],
    ['tooltip-demo', 'demo/src/patterns/tooltip/Tooltip.apg.test.tsx', 16, 'Tooltip focus test emits React act warning', 'The tooltip show transition updates state outside act, so the focus assertion is racing React updates.'],
    ['keyboard-host', 'src/tests/keyboardBehavior.test.tsx', 1, 'Keyboard behavior tests emit React act warnings', 'The generic keyboard host updates state outside act while asserting preventDefault behavior.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'test-warning', fix: 'Wrap keyboard interactions in act or use Testing Library helpers that flush React updates.' })),

  ...[
    ['app-pattern-param', 'demo/src/app/appState.ts', 58, 'Unknown hash pattern falls back silently without repairing the URL', 'A bad pattern parameter renders the default pattern while the address bar still contains the invalid pattern, leaving share links misleading.'],
    ['app-panel-param', 'demo/src/app/appState.ts', 67, 'Unknown panel hash value is silently normalized in state only', 'Invalid panel values fall back to preview internally without updating the hash, so reload/share behavior is inconsistent.'],
    ['app-source-param', 'demo/src/app/appState.ts', 70, 'Unknown source hash value survives after fallback', 'The app picks a default source but leaves the invalid source query in the hash until another source action happens.'],
    ['variant-route', 'demo/src/shared/variantRoute.tsx', 20, 'Unknown variant hash value is not canonicalized', 'A bad variant parameter falls back in runtime state while the URL continues to advertise an unavailable variant.'],
    ['hash-replace', 'demo/src/app/appState.ts', 83, 'Hash updates use replaceState for user navigation', 'Pattern, panel, and source changes overwrite history instead of adding entries, so browser Back cannot step through demo navigation.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'routing-state', fix: 'Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.' })),

  ...[
    ['kernel-controls-first-only', 'src/kernel/kernelAriaSources.ts', 25, 'relations.controlsByKey exposes only the first controlled element', 'The schema allows multiple controlled keys, but aria-controls generation drops every key after index 0. Multi-panel patterns lose relationships.'],
    ['kernel-owner-single', 'src/schema/patternData.ts', 28, 'relations.ownerByKey cannot represent multiple labels', 'The schema only allows a single owner per key, so patterns that need multiple labelling elements cannot model them.'],
    ['runtime-raw-id-default', 'src/kernel/patternRuntime.ts', 50, 'Base runtime default id is the raw key', 'Calling createPatternRuntime without a custom keyToElementId emits ids equal to arbitrary data keys.'],
    ['part-props-root-id', 'src/kernel/runtimePartProps.ts', 33, 'Every keyed part receives an id even when the part should not be referenced', 'The runtime adds ids to all keyed parts, increasing duplicate-id exposure for visual-only or repeated structural parts.'],
    ['focus-target-body', 'src/adapters/reactFocusEffectTarget.ts', 10, 'Focus effect fails silently when generated id is missing', 'Missing or duplicate activeKey ids produce no focus movement and no diagnostic, making focus regressions hard to detect.'],
    ['element-target-first-focusable', 'src/adapters/reactElementTargets.ts', 15, 'firstFocusable target can select hidden or disabled descendants', 'querySelector uses a broad focusable selector without visibility checks, so focus trap restoration can land on hidden content.'],
    ['roving-timeout', 'src/adapters/reactRovingFocus.ts', 41, 'Roving focus schedules an uncancelled timeout', 'The delayed focus fallback can run after unmount or after activeKey changes again, moving focus to stale elements.'],
    ['effect-runner-no-error', 'src/adapters/reactEffectRunner.ts', 34, 'Focus effect ignores unresolved targets', 'A broken id relation or missing DOM node fails silently instead of surfacing a development warning.'],
    ['trap-root-missing', 'src/adapters/reactPatternTrapFocus.ts', 20, 'Focus trap does nothing when root relation is missing', 'Broken trap configuration silently disables focus containment.'],
    ['data-validator-ids', 'src/schema/patternDataRefValidators.ts', 36, 'Data validation checks keys but not generated id collisions', 'Relations can be internally valid while still producing duplicate DOM ids after prefixing/normalization.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'kernel-contract', fix: 'Add validation or development diagnostics at the runtime boundary.' })),

  ...[
    ['checkbox-group-id', 'demo/src/patterns/checkbox/Checkbox.tsx', 47, 'Checkbox demo group label id is hardcoded', 'Rendering the checkbox demo twice creates duplicate group-label ids and breaks aria-labelledby resolution.'],
    ['combobox-listbox-id', 'demo/src/patterns/combobox/Combobox.tsx', 23, 'Combobox popup id is hardcoded by the demo contract', 'Multiple combobox demos on one page produce duplicate listbox ids referenced by aria-controls.'],
    ['dialog-field-id', 'demo/src/patterns/dialog/Dialog.tsx', 43, 'Dialog form field ids are hardcoded', 'Multiple dialog demos produce duplicate dialog-name and dialog-email ids.'],
    ['menubar-popup-label', 'demo/src/patterns/menu/Menubar.tsx', 49, 'Menubar submenu label id is manually reconstructed', 'The submenu uses menubar-${ownerKey} instead of the runtime id resolver, so custom prefixes break aria-labelledby.'],
    ['menubar-item-id', 'demo/src/patterns/menu/Menubar.tsx', 68, 'Menubar demo item id is manually reconstructed', 'The demo hardcodes menubar-${itemKey}, diverging from runtime ids when a custom prefix is supplied.'],
    ['slider-testid', 'demo/src/patterns/slider/Slider.tsx', 58, 'Slider test ids interpolate raw keys', 'Keys containing spaces or punctuation create brittle test selectors and duplicate data-testid values across slider instances.'],
    ['spinbutton-testid', 'demo/src/patterns/spinbutton/Spinbutton.tsx', 50, 'Spinbutton test ids interpolate raw keys', 'Raw key interpolation in data-testid makes test selectors unstable for non-slug keys.'],
    ['windowsplitter-primary-testid', 'demo/src/patterns/windowsplitter/WindowSplitter.tsx', 23, 'Window splitter primary pane test id is fixed', 'Multiple splitters expose identical data-testid values, making tests and recorder output ambiguous.'],
    ['windowsplitter-secondary-testid', 'demo/src/patterns/windowsplitter/WindowSplitter.tsx', 31, 'Window splitter secondary pane test id is fixed', 'Multiple splitters expose identical data-testid values for the secondary pane.'],
    ['carousel-dot-testid', 'demo/src/patterns/carousel/Carousel.tsx', 69, 'Carousel dot test ids interpolate raw slide keys', 'Raw slide keys can create duplicate or selector-hostile test ids.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'demo-id', fix: 'Route every id and test id through the pattern id namespace or a demo-local unique prefix.' })),

  ...[
    ['source-copy-optional', 'demo/src/app/sourcePreview.ts', 62, 'Clipboard success is inferred from navigator.clipboard existence', 'If writeText resolves but clipboard becomes unavailable, or if a mocked writeText is missing, copy status can be wrong.'],
    ['copy-reset-race', 'demo/src/app/useSourcePreviewState.ts', 44, 'Copy status reset timer can race repeated copy actions', 'A previous timer can reset the status shortly after a later copy unless every transition clears the old timer before scheduling.'],
    ['main-root-null', 'demo/src/app/main.tsx', 8, 'App startup assumes #root exists', 'The non-null assertion turns a missing root element into an opaque React crash instead of a clear startup error.'],
    ['source-panel-label', 'demo/src/app/ActiveDemoRightPanel.tsx', 68, 'Copy button accessible name changes to copied/failed', 'Changing the aria-label to state text removes the stable command name from assistive technology.'],
    ['workspace-shortcuts', 'demo/src/app/ActiveDemoWorkspace.tsx', 88, 'Preview keyboard shortcuts are exposed on a generic div', 'aria-keyshortcuts on a non-focusable preview container can be missed by assistive tech.'],
    ['pattern-menu-option-cast', 'demo/src/app/PatternMenu.tsx', 28, 'Pattern menu casts option props instead of preserving types', 'The cast can hide missing ARIA props from the listbox adapter contract.'],
    ['variant-listbox-cast', 'demo/src/shared/demo-definition/VariantListbox.tsx', 42, 'Variant listbox casts root props instead of preserving types', 'The cast can hide incompatible root props and makes regression tests the only guard.'],
    ['variant-focus-effect', 'demo/src/shared/demo-definition/VariantListbox.tsx', 26, 'Variant listbox focuses selected option on every selectedKey change', 'Programmatic route changes can unexpectedly steal focus from the active demo.'],
    ['sources-collision', 'demo/src/shared/sources.ts', 14, 'Source module lookup depends on path conventions', 'Moving source files without updating glob roots can make source tabs render empty text at runtime.'],
    ['icon-hidden', 'demo/src/shared/Icon.tsx', 29, 'Icon component always hides icons from assistive tech', 'Any icon-only button using this component without an external label becomes unnamed.'],
    ['repro-fiber-private', 'demo/src/app/repro-recorder/createReproRecorder.ts', 62, 'Recorder depends on private React fiber keys', 'React internal key names can change, breaking component labels in recordings.'],
    ['repro-route', 'demo/src/app/repro-recorder/createReproRecorder.ts', 82, 'Recorder omits search params from route snapshots', 'Only pathname and hash are recorded, so query-string state is lost.'],
    ['repro-start-date', 'demo/src/app/repro-recorder/createReproRecorder.ts', 298, 'Recorder derives start time from Date.now minus performance.now delta', 'System clock changes during recording can produce inaccurate startedAt timestamps.'],
    ['aria-tree-controls', 'demo/src/app/repro-recorder/reproARIATree.ts', 84, 'ARIA tree serializer follows aria-controls without cycle protection', 'Cyclic or repeated aria-controls relationships can duplicate output or recurse through already serialized regions.'],
    ['overlay-shortcut-capture', 'demo/src/app/repro-recorder/ReproRecorderOverlay.tsx', 107, 'Recorder overlay captures keydown globally', 'Global capture can intercept pattern keyboard demos before they handle the shortcut.'],
    ['overlay-copy-failure', 'demo/src/app/repro-recorder/ReproRecorderOverlay.tsx', 61, 'Recorder copy uses clipboard without fallback', 'Browsers that block clipboard writes leave the user without a downloadable or selectable recording path.'],
    ['preview-source-empty', 'demo/src/app/sourcePreview.ts', 1, 'Source preview does not surface loader failures as structured state', 'A failed dynamic raw import can collapse into a generic rejected promise instead of a visible per-tab error.'],
    ['active-workspace-event', 'demo/src/app/ActiveDemoWorkspace.tsx', 23, 'Pattern events are redispatched globally without namespacing', 'Embedding multiple demo workspaces on one page mixes event logs between instances.'],
  ].map(([id, file, line, title, impact]) => ({ id, file, line, title, impact, category: 'app-demo', fix: 'Add instance scoping, stable accessible names, and explicit error/fallback handling.' })),
]

const selectedReports = reports.slice(0, 100)

if (selectedReports.length !== 100) {
  throw new Error(`Expected 100 reports, got ${selectedReports.length}`)
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const index = []
selectedReports.forEach((report, indexZero) => {
  const n = String(indexZero + 1).padStart(3, '0')
  const filename = `bug-${n}-${report.id}.md`
  const path = join(outDir.pathname, filename)
  mkdirSync(dirname(path), { recursive: true })
  const body = `# Bug ${n}: ${report.title}

- Category: ${report.category}
- Evidence: \`${report.file}:${report.line}\`
- Impact: ${report.impact}
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: ${report.fix}
`
  writeFileSync(path, body)
  index.push(`- [Bug ${n}: ${report.title}](./${filename})`)
})

writeFileSync(join(outDir.pathname, 'README.md'), `# Bug Reports

100 bug reports generated from static inspection and test output.

${index.join('\n')}
`)
