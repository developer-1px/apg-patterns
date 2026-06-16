# @interactive-os/aria API Reference

This file lists the published entrypoints and export names included in the npm package.

## Entrypoints

```ts
import { createPatternRuntime } from '@interactive-os/aria'
import { createPatternRuntime } from '@interactive-os/aria/core'
import { Button, useButtonPattern } from '@interactive-os/aria/react'
import type { PatternData, PatternEvent } from '@interactive-os/aria'
```

- `@interactive-os/aria`: React-free root entry.
- `@interactive-os/aria/core`: React-free core entry with the same export surface as the root entry.
- `@interactive-os/aria/react`: core exports plus React hooks, runtimes, render items, and preset components.

The export lists include runtime values and TypeScript type-only names. The runtime value sections list names that JavaScript consumers can import at runtime.

## Grid Selection Contract

`gridDefinition` keeps range selection opt-in. Set `selectionMode: 'multiple'` in `PatternOptions`, or `state.multiselectable` in grid data, to enable `Shift+Arrow*`, `Shift+Home`, `Shift+End`, `Control+a`, `Control+Space`, and `Shift+Space`. `useGridPattern` returns `state.selectedKeys`, `state.anchorKey`, and `state.extentKey`, and each `ReactGridCell` exposes `state.selected` plus `aria-selected` in `cellProps`.

## Command Surface Helpers

`@interactive-os/aria/react` exports `createToolbarPatternData`, `createRadioGroupPatternData`, `createMenuButtonPatternData`, and `usePatternStateReducer`. Pass `{ state, onStateChange }` to `usePatternStateReducer` when the app owns reducer state. Use these helpers for flat command surfaces where an array of keys, labels, disabled state, checked state, and initial selection fully describes the APG data. Build `PatternData` directly when relations, geometry, custom state records, async state, or domain metadata are part of the public contract.

## WindowSplitter Value Helpers

`@interactive-os/aria`, `@interactive-os/aria/core`, and `@interactive-os/aria/react` export `reduceWindowSplitterValue`, `resolveWindowSplitterStepValue`, and `resolveWindowSplitterValueRange`. Use these to connect `valueStep` and `collapse` events to app-owned splitter state. `min` defaults to `0`, `max` to `100`, `step` to `1`, and `largeStep` to one tenth of a finite range, never below `step`. Helper options may use `max: Infinity`; that disables the upper clamp, defaults `largeStep` to `step * 10`, and makes `max` value-steps keep the current value.

## Autocomplete Listbox Owner

`@interactive-os/aria/react` exports `useAutocompleteListbox` and `dispatchAutocompleteOwnerKeyDown`. They connect an app-owned input or contenteditable editor to existing listbox option props while keeping DOM focus on the editor. Owner props compose `role="combobox"`, popup ARIA, active descendant state, and ArrowUp/ArrowDown/Enter/Tab/Escape dispatch.

## Menubar Submenu Props

`useMenubarPattern` returns `submenuProps(ownerKey)` for open submenu containers. The props include `role="menu"`, `aria-labelledby`, and keyboard handling for ArrowUp/ArrowDown/Home/End, Escape, ArrowLeft, and ArrowRight while reusing existing menubar state events.

## Controlled Dialog Hooks

`useControlledDialogPattern` and `useControlledAlertDialogPattern` support app-state-owned dialogs without a rendered trigger item. They take `{ open, onOpenChange, onEvent?, initialFocusKey?, restoreFocusTo? }`, provide dialog props, trap focus while open, close with `onOpenChange(false)`, and emit `dismiss` when `onEvent` is supplied.

## Menu Item Roles

Menu item props use `item.kind` to choose `menuitem`, `menuitemcheckbox`, or `menuitemradio`. Items present in `state.checkedByKey` without an explicit kind default to `menuitemcheckbox`; checkable roles receive `aria-checked` from `checkedByKey`.

## Public Surface Manifest

Each line maps `export | bucket | tier`. `npm run check:api` verifies these
blocks against the built declaration files, bucket policy, and taxonomy in
`INTERFACE_STABILITY.md`. The same gate also verifies
`scripts/fixtures/public-api-contract.json` and
`scripts/fixtures/public-pattern-contracts.json` against the built core
entrypoint so the permanent `PatternDefinition`, `PatternData`,
`PatternEvent`, `createPatternRuntime`, `reducePatternData`, and selected
high-risk pattern definition contracts keep their baseline schema and runtime
semantics.

### Root And Core Public Surface

<!-- apg-api:root-core-surface:start -->
```txt
accordionDefinition | apg-pattern-definition | permanent-catalog
alertDefinition | apg-pattern-definition | permanent-catalog
alertDialogDefinition | apg-pattern-definition | permanent-catalog
AriaAttribute | core-contract-type | permanent-core
AriaAttributeSchema | schema-validator | permanent-validation
AriaProjection | core-contract-type | permanent-core
AriaProjectionSchema | schema-validator | permanent-validation
AriaRole | core-contract-type | permanent-core
AriaRoleSchema | schema-validator | permanent-validation
AriaSourcePath | core-contract-type | permanent-core
AriaSourcePathSchema | schema-validator | permanent-validation
AriaSourceResolver | extension-resolver-type | stable-extension
breadcrumbDefinition | apg-pattern-definition | permanent-catalog
buttonDefinition | apg-pattern-definition | permanent-catalog
carouselDefinition | apg-pattern-definition | permanent-catalog
checkboxDefinition | apg-pattern-definition | permanent-catalog
clampWindowSplitterValue | core-data-helper | narrow-core-helper
comboboxDefinition | apg-pattern-definition | permanent-catalog
createParentByKey | core-data-helper | narrow-core-helper
createPatternRuntime | runtime-boundary | permanent-runtime
CreatePatternRuntimeInput | core-contract-type | permanent-core
defineAriaSource | extension-vocabulary | stable-extension
defineDomEvent | extension-vocabulary | stable-extension
defineKeyToken | extension-vocabulary | stable-extension
defineNavigationTarget | extension-vocabulary | stable-extension
definePredicate | extension-vocabulary | stable-extension
defineStateProjection | extension-vocabulary | stable-extension
defineVisibleOrder | extension-vocabulary | stable-extension
dialogDefinition | apg-pattern-definition | permanent-catalog
disclosureDefinition | apg-pattern-definition | permanent-catalog
DomEventName | core-contract-type | permanent-core
DomEventNameSchema | schema-validator | permanent-validation
EffectDefinition | core-contract-type | permanent-core
EffectSchema | schema-validator | permanent-validation
ElementTarget | core-contract-type | permanent-core
ElementTargetSchema | schema-validator | permanent-validation
evaluatePredicate | runtime-resolver | stable-extension
EventTemplate | core-contract-type | permanent-core
EventTemplateSchema | schema-validator | permanent-validation
EventValueSource | core-contract-type | permanent-core
EventValueSourceSchema | schema-validator | permanent-validation
feedDefinition | apg-pattern-definition | permanent-catalog
FocusEffectScopeSchema | schema-validator | permanent-validation
FocusEffectTargetSchema | schema-validator | permanent-validation
FocusEffectTriggerSchema | schema-validator | permanent-validation
FocusModel | core-contract-type | permanent-core
FocusModelSchema | schema-validator | permanent-validation
FocusProjection | core-contract-type | permanent-core
FocusProjectionSchema | schema-validator | permanent-validation
getTabsDataDiagnostics | core-data-helper | narrow-core-helper
getWindowSplitterDataDiagnostics | core-data-helper | narrow-core-helper
gridDefinition | apg-pattern-definition | permanent-catalog
IdRefListSchema | schema-validator | permanent-validation
isRegisteredAriaSource | extension-vocabulary | stable-extension
isRegisteredNavigationTarget | extension-vocabulary | stable-extension
isRegisteredPredicate | extension-vocabulary | stable-extension
isRegisteredStateProjection | extension-vocabulary | stable-extension
isRegisteredVisibleOrder | extension-vocabulary | stable-extension
Key | core-contract-type | permanent-core
KeyboardBinding | core-contract-type | permanent-core
KeyboardBindingSchema | schema-validator | permanent-validation
KeyboardCaseSchema | schema-validator | permanent-validation
KeyInput | core-contract-type | permanent-core
KeySchema | schema-validator | permanent-validation
KeyTokenSchema | schema-validator | permanent-validation
landmarksDefinition | apg-pattern-definition | permanent-catalog
linkDefinition | apg-pattern-definition | permanent-catalog
listboxDefinition | apg-pattern-definition | permanent-catalog
menubarDefinition | apg-pattern-definition | permanent-catalog
menuButtonDefinition | apg-pattern-definition | permanent-catalog
meterDefinition | apg-pattern-definition | permanent-catalog
ModifierKeyName | core-contract-type | permanent-core
NavigationSchema | schema-validator | permanent-validation
NavigationTargetContext | core-contract-type | permanent-core
NavigationTargetKind | core-contract-type | permanent-core
NavigationTargetKindSchema | schema-validator | permanent-validation
NavigationTargetResolver | extension-resolver-type | stable-extension
NavigationTargetSchema | schema-validator | permanent-validation
PartEventBinding | core-contract-type | permanent-core
PartEventBindingSchema | schema-validator | permanent-validation
PartSchema | schema-validator | permanent-validation
PatternData | core-contract-type | permanent-core
PatternDataSchema | schema-validator | permanent-validation
PatternDefinition | core-contract-type | permanent-core
PatternDefinitionSchema | schema-validator | permanent-validation
PatternDirection | core-contract-type | permanent-core
PatternDirectionSchema | schema-validator | permanent-validation
PatternEvent | core-contract-type | permanent-core
PatternEventMetaSchema | schema-validator | permanent-validation
PatternEventReason | core-contract-type | permanent-core
PatternEventReasonSchema | schema-validator | permanent-validation
PatternEventSchema | schema-validator | permanent-validation
PatternEventType | core-contract-type | permanent-core
PatternEventTypeSchema | schema-validator | permanent-validation
PatternItem | core-contract-type | permanent-core
PatternItemSchema | schema-validator | permanent-validation
PatternOptions | core-contract-type | permanent-core
PatternOptionsSchema | schema-validator | permanent-validation
PatternRefsSchema | schema-validator | permanent-validation
PatternRelationsSchema | schema-validator | permanent-validation
PatternRuntime | core-contract-type | permanent-core
PatternRuntimeContext | core-contract-type | permanent-core
PatternState | core-contract-type | permanent-core
PatternStateSchema | schema-validator | permanent-validation
PatternValueStepDirection | core-contract-type | permanent-core
PatternValueStepDirectionSchema | schema-validator | permanent-validation
Predicate | core-contract-type | permanent-core
PredicateResolver | extension-resolver-type | stable-extension
PredicateSchema | schema-validator | permanent-validation
radioGroupDefinition | apg-pattern-definition | permanent-catalog
reducePatternData | runtime-boundary | permanent-runtime
reduceWindowSplitterValue | core-data-helper | narrow-core-helper
resolveAriaSource | runtime-resolver | stable-extension
resolveEventTemplate | runtime-resolver | stable-extension
resolveKeyToken | runtime-resolver | stable-extension
resolveNavigationTarget | runtime-resolver | stable-extension
resolveStateProjection | runtime-resolver | stable-extension
resolveVisibleOrder | runtime-resolver | stable-extension
resolveWindowSplitterStepValue | core-data-helper | narrow-core-helper
resolveWindowSplitterValueRange | core-data-helper | narrow-core-helper
sliderDefinition | apg-pattern-definition | permanent-catalog
SlotProps | core-contract-type | permanent-core
spinbuttonDefinition | apg-pattern-definition | permanent-catalog
StateAction | core-contract-type | permanent-core
StateActionSchema | schema-validator | permanent-validation
StateField | core-contract-type | permanent-core
StateFieldSchema | schema-validator | permanent-validation
StateProjection | core-contract-type | permanent-core
StateProjectionResolver | extension-resolver-type | stable-extension
StateProjectionSchema | schema-validator | permanent-validation
switchDefinition | apg-pattern-definition | permanent-catalog
tableDefinition | apg-pattern-definition | permanent-catalog
TabsDataDiagnostic | core-contract-type | permanent-core
TabsDataDiagnosticCode | core-contract-type | permanent-core
tabsDefinition | apg-pattern-definition | permanent-catalog
toolbarDefinition | apg-pattern-definition | permanent-catalog
tooltipDefinition | apg-pattern-definition | permanent-catalog
Transition | core-contract-type | permanent-core
TransitionSchema | schema-validator | permanent-validation
TransitionValue | core-contract-type | permanent-core
TransitionValueSchema | schema-validator | permanent-validation
treegridDefinition | apg-pattern-definition | permanent-catalog
treeviewDefinition | apg-pattern-definition | permanent-catalog
VisibleOrderKind | core-contract-type | permanent-core
VisibleOrderKindSchema | schema-validator | permanent-validation
VisibleOrderResolver | extension-resolver-type | stable-extension
VisibleOrderSchema | schema-validator | permanent-validation
WindowSplitterDataDiagnostic | core-contract-type | permanent-core
WindowSplitterDataDiagnosticCode | core-contract-type | permanent-core
windowSplitterDefinition | apg-pattern-definition | permanent-catalog
WindowSplitterValueData | core-contract-type | permanent-core
WindowSplitterValueOptions | core-contract-type | permanent-core
WindowSplitterValueRange | core-contract-type | permanent-core
WindowSplitterValueState | core-contract-type | permanent-core
```
<!-- apg-api:root-core-surface:end -->

### React-Only Public Surface

<!-- apg-api:react-only-surface:start -->
```txt
Accordion | react-preset-component | framework-adapter
AccordionProps | react-preset-props | framework-adapter
Alert | react-preset-component | framework-adapter
AlertDialog | react-preset-component | framework-adapter
AlertDialogProps | react-preset-props | framework-adapter
AlertProps | react-preset-props | framework-adapter
AutocompleteListboxActions | react-owner-adapter | narrow-react-adapter
AutocompleteListboxOptions | react-owner-adapter | narrow-react-adapter
AutocompleteListboxState | react-owner-adapter | narrow-react-adapter
AutocompleteOwnerAutocomplete | react-owner-adapter | narrow-react-adapter
Breadcrumb | react-preset-component | framework-adapter
BreadcrumbProps | react-preset-props | framework-adapter
Button | react-preset-component | framework-adapter
ButtonProps | react-preset-props | framework-adapter
Carousel | react-preset-component | framework-adapter
CarouselProps | react-preset-props | framework-adapter
Checkbox | react-preset-component | framework-adapter
CheckboxProps | react-preset-props | framework-adapter
Combobox | react-preset-component | framework-adapter
ComboboxProps | react-preset-props | framework-adapter
CommandSurfaceDataOptions | react-data-helper | narrow-react-helper
CommandSurfaceItem | react-data-helper | narrow-react-helper
createMenuButtonPatternData | react-data-helper | narrow-react-helper
createRadioGroupPatternData | react-data-helper | narrow-react-helper
createToolbarPatternData | react-data-helper | narrow-react-helper
Dialog | react-preset-component | framework-adapter
DialogProps | react-preset-props | framework-adapter
Disclosure | react-preset-component | framework-adapter
DisclosureProps | react-preset-props | framework-adapter
dispatchAutocompleteOwnerKeyDown | react-owner-adapter | narrow-react-adapter
Feed | react-preset-component | framework-adapter
FeedProps | react-preset-props | framework-adapter
Grid | react-preset-component | framework-adapter
GridProps | react-preset-props | framework-adapter
Landmarks | react-preset-component | framework-adapter
LandmarksProps | react-preset-props | framework-adapter
Link | react-preset-component | framework-adapter
LinkProps | react-preset-props | framework-adapter
Listbox | react-preset-component | framework-adapter
ListboxProps | react-preset-props | framework-adapter
Menu | react-preset-component | framework-adapter
Menubar | react-preset-component | framework-adapter
MenubarProps | react-preset-props | framework-adapter
MenuButton | react-preset-component | framework-adapter
MenuButtonCommandSurfaceDataOptions | react-data-helper | narrow-react-helper
MenuButtonProps | react-preset-props | framework-adapter
MenuProps | react-preset-props | framework-adapter
Meter | react-preset-component | framework-adapter
MeterProps | react-preset-props | framework-adapter
PatternStateReducerOptions | react-state-helper | narrow-react-helper
PatternStateReducerResult | react-state-helper | narrow-react-helper
RadioGroup | react-preset-component | framework-adapter
RadioGroupProps | react-preset-props | framework-adapter
ReactAccordionRenderItem | react-render-surface-type | framework-adapter
ReactAccordionRuntime | react-runtime-type | framework-adapter
ReactAlertDialogRuntime | react-runtime-type | framework-adapter
ReactAlertRuntime | react-runtime-type | framework-adapter
ReactAutocompleteListboxRuntime | react-runtime-type | framework-adapter
ReactBreadcrumbItem | react-render-surface-type | framework-adapter
ReactBreadcrumbRuntime | react-runtime-type | framework-adapter
ReactButtonRuntime | react-runtime-type | framework-adapter
ReactCarouselRuntime | react-runtime-type | framework-adapter
ReactCarouselSlide | react-render-surface-type | framework-adapter
ReactCheckboxRenderItem | react-render-surface-type | framework-adapter
ReactCheckboxRuntime | react-runtime-type | framework-adapter
ReactComboboxOption | react-render-surface-type | framework-adapter
ReactComboboxRuntime | react-runtime-type | framework-adapter
ReactControlledAlertDialogRuntime | react-runtime-type | framework-adapter
ReactControlledDialogConfig | react-state-helper | narrow-react-helper
ReactControlledDialogOpenChangeMeta | react-state-helper | narrow-react-helper
ReactControlledDialogRuntime | react-runtime-type | framework-adapter
ReactDialogFocusTarget | react-state-helper | narrow-react-helper
ReactDialogRuntime | react-runtime-type | framework-adapter
ReactDisclosureItem | react-render-surface-type | framework-adapter
ReactDisclosureRuntime | react-runtime-type | framework-adapter
ReactFeedArticle | react-render-surface-type | framework-adapter
ReactFeedRuntime | react-runtime-type | framework-adapter
ReactGridCell | react-render-surface-type | framework-adapter
ReactGridRow | react-render-surface-type | framework-adapter
ReactGridRuntime | react-runtime-type | framework-adapter
ReactLandmarkItem | react-render-surface-type | framework-adapter
ReactLandmarksRuntime | react-runtime-type | framework-adapter
ReactLinkRuntime | react-runtime-type | framework-adapter
ReactListboxRenderItem | react-render-surface-type | framework-adapter
ReactListboxRuntime | react-runtime-type | framework-adapter
ReactMenubarItem | react-render-surface-type | framework-adapter
ReactMenubarRuntime | react-runtime-type | framework-adapter
ReactMenuButtonRuntime | react-runtime-type | framework-adapter
ReactMenuButtonTriggerState | react-data-helper | narrow-react-helper
ReactMenuItem | react-render-surface-type | framework-adapter
ReactMenuPatternOptions | react-runtime-type | framework-adapter
ReactMenuRuntime | react-runtime-type | framework-adapter
ReactMeterRenderItem | react-render-surface-type | framework-adapter
ReactMeterRuntime | react-runtime-type | framework-adapter
ReactRadioGroupOptions | react-runtime-type | framework-adapter
ReactRadioGroupRuntime | react-runtime-type | framework-adapter
ReactRadioRenderItem | react-render-surface-type | framework-adapter
ReactSliderRenderItem | react-render-surface-type | framework-adapter
ReactSliderRuntime | react-runtime-type | framework-adapter
ReactSpinbuttonRenderItem | react-render-surface-type | framework-adapter
ReactSpinbuttonRuntime | react-runtime-type | framework-adapter
ReactSwitchRenderItem | react-render-surface-type | framework-adapter
ReactSwitchRuntime | react-runtime-type | framework-adapter
ReactTableCell | react-render-surface-type | framework-adapter
ReactTableRow | react-render-surface-type | framework-adapter
ReactTableRuntime | react-runtime-type | framework-adapter
ReactTabsRuntime | react-runtime-type | framework-adapter
ReactToolbarItemKind | react-data-helper | narrow-react-helper
ReactToolbarRenderItem | react-render-surface-type | framework-adapter
ReactToolbarRuntime | react-runtime-type | framework-adapter
ReactTooltipRuntime | react-runtime-type | framework-adapter
ReactTreegridCell | react-render-surface-type | framework-adapter
ReactTreegridRow | react-render-surface-type | framework-adapter
ReactTreegridRuntime | react-runtime-type | framework-adapter
ReactTreeviewRenderItem | react-render-surface-type | framework-adapter
ReactTreeviewRuntime | react-runtime-type | framework-adapter
ReactWindowSplitterRuntime | react-runtime-type | framework-adapter
SelectableCommandSurfaceDataOptions | react-data-helper | narrow-react-helper
Slider | react-preset-component | framework-adapter
SliderProps | react-preset-props | framework-adapter
Spinbutton | react-preset-component | framework-adapter
SpinbuttonProps | react-preset-props | framework-adapter
Switch | react-preset-component | framework-adapter
SwitchProps | react-preset-props | framework-adapter
Table | react-preset-component | framework-adapter
TableProps | react-preset-props | framework-adapter
Tabs | react-preset-component | framework-adapter
TabsProps | react-preset-props | framework-adapter
Toolbar | react-preset-component | framework-adapter
ToolbarProps | react-preset-props | framework-adapter
Tooltip | react-preset-component | framework-adapter
TooltipProps | react-preset-props | framework-adapter
Treegrid | react-preset-component | framework-adapter
TreegridProps | react-preset-props | framework-adapter
Treeview | react-preset-component | framework-adapter
TreeviewProps | react-preset-props | framework-adapter
useAccordionPattern | react-pattern-hook | framework-adapter
useAlertDialogPattern | react-pattern-hook | framework-adapter
useAlertPattern | react-pattern-hook | framework-adapter
useAutocompleteListbox | react-owner-adapter | narrow-react-adapter
useBreadcrumbPattern | react-pattern-hook | framework-adapter
useButtonPattern | react-pattern-hook | framework-adapter
useCarouselPattern | react-pattern-hook | framework-adapter
useCheckboxPattern | react-pattern-hook | framework-adapter
useComboboxPattern | react-pattern-hook | framework-adapter
useControlledAlertDialogPattern | react-pattern-hook | framework-adapter
useControlledDialogPattern | react-pattern-hook | framework-adapter
useDialogPattern | react-pattern-hook | framework-adapter
useDisclosurePattern | react-pattern-hook | framework-adapter
useFeedPattern | react-pattern-hook | framework-adapter
useGridPattern | react-pattern-hook | framework-adapter
useLandmarksPattern | react-pattern-hook | framework-adapter
useLinkPattern | react-pattern-hook | framework-adapter
useListboxPattern | react-pattern-hook | framework-adapter
useMenubarPattern | react-pattern-hook | framework-adapter
useMenuButtonPattern | react-pattern-hook | framework-adapter
useMenuPattern | react-pattern-hook | framework-adapter
useMeterPattern | react-pattern-hook | framework-adapter
usePatternStateReducer | react-state-helper | narrow-react-helper
useRadioGroupPattern | react-pattern-hook | framework-adapter
useSliderPattern | react-pattern-hook | framework-adapter
useSpinbuttonPattern | react-pattern-hook | framework-adapter
useSwitchPattern | react-pattern-hook | framework-adapter
useTablePattern | react-pattern-hook | framework-adapter
useTabsPattern | react-pattern-hook | framework-adapter
useToolbarPattern | react-pattern-hook | framework-adapter
useTooltipPattern | react-pattern-hook | framework-adapter
useTreegridPattern | react-pattern-hook | framework-adapter
useTreeviewPattern | react-pattern-hook | framework-adapter
useWindowSplitterPattern | react-pattern-hook | framework-adapter
WindowSplitter | react-preset-component | framework-adapter
WindowSplitterProps | react-preset-props | framework-adapter
```
<!-- apg-api:react-only-surface:end -->

## Root And Core Exports

<!-- apg-api:root-core:start -->
```txt
accordionDefinition
alertDefinition
alertDialogDefinition
AriaAttribute
AriaAttributeSchema
AriaProjection
AriaProjectionSchema
AriaRole
AriaRoleSchema
AriaSourcePath
AriaSourcePathSchema
AriaSourceResolver
breadcrumbDefinition
buttonDefinition
carouselDefinition
checkboxDefinition
clampWindowSplitterValue
comboboxDefinition
createParentByKey
createPatternRuntime
CreatePatternRuntimeInput
defineAriaSource
defineDomEvent
defineKeyToken
defineNavigationTarget
definePredicate
defineStateProjection
defineVisibleOrder
dialogDefinition
disclosureDefinition
DomEventName
DomEventNameSchema
EffectDefinition
EffectSchema
ElementTarget
ElementTargetSchema
evaluatePredicate
EventTemplate
EventTemplateSchema
EventValueSource
EventValueSourceSchema
feedDefinition
FocusEffectScopeSchema
FocusEffectTargetSchema
FocusEffectTriggerSchema
FocusModel
FocusModelSchema
FocusProjection
FocusProjectionSchema
getTabsDataDiagnostics
getWindowSplitterDataDiagnostics
gridDefinition
IdRefListSchema
isRegisteredAriaSource
isRegisteredNavigationTarget
isRegisteredPredicate
isRegisteredStateProjection
isRegisteredVisibleOrder
Key
KeyboardBinding
KeyboardBindingSchema
KeyboardCaseSchema
KeyInput
KeySchema
KeyTokenSchema
landmarksDefinition
linkDefinition
listboxDefinition
menubarDefinition
menuButtonDefinition
meterDefinition
ModifierKeyName
NavigationSchema
NavigationTargetContext
NavigationTargetKind
NavigationTargetKindSchema
NavigationTargetResolver
NavigationTargetSchema
PartEventBinding
PartEventBindingSchema
PartSchema
PatternData
PatternDataSchema
PatternDefinition
PatternDefinitionSchema
PatternDirection
PatternDirectionSchema
PatternEvent
PatternEventMetaSchema
PatternEventReason
PatternEventReasonSchema
PatternEventSchema
PatternEventType
PatternEventTypeSchema
PatternItem
PatternItemSchema
PatternOptions
PatternOptionsSchema
PatternRefsSchema
PatternRelationsSchema
PatternRuntime
PatternRuntimeContext
PatternState
PatternStateSchema
PatternValueStepDirection
PatternValueStepDirectionSchema
Predicate
PredicateResolver
PredicateSchema
radioGroupDefinition
reducePatternData
reduceWindowSplitterValue
resolveAriaSource
resolveEventTemplate
resolveKeyToken
resolveNavigationTarget
resolveStateProjection
resolveVisibleOrder
resolveWindowSplitterStepValue
resolveWindowSplitterValueRange
sliderDefinition
SlotProps
spinbuttonDefinition
StateAction
StateActionSchema
StateField
StateFieldSchema
StateProjection
StateProjectionResolver
StateProjectionSchema
switchDefinition
tableDefinition
TabsDataDiagnostic
TabsDataDiagnosticCode
tabsDefinition
toolbarDefinition
tooltipDefinition
Transition
TransitionSchema
TransitionValue
TransitionValueSchema
treegridDefinition
treeviewDefinition
VisibleOrderKind
VisibleOrderKindSchema
VisibleOrderResolver
VisibleOrderSchema
WindowSplitterDataDiagnostic
WindowSplitterDataDiagnosticCode
windowSplitterDefinition
WindowSplitterValueData
WindowSplitterValueOptions
WindowSplitterValueRange
WindowSplitterValueState
```
<!-- apg-api:root-core:end -->

## Root And Core Runtime Values

<!-- apg-api:root-core-runtime:start -->
```txt
accordionDefinition
alertDefinition
alertDialogDefinition
AriaAttributeSchema
AriaProjectionSchema
AriaRoleSchema
AriaSourcePathSchema
breadcrumbDefinition
buttonDefinition
carouselDefinition
checkboxDefinition
clampWindowSplitterValue
comboboxDefinition
createParentByKey
createPatternRuntime
defineAriaSource
defineDomEvent
defineKeyToken
defineNavigationTarget
definePredicate
defineStateProjection
defineVisibleOrder
dialogDefinition
disclosureDefinition
DomEventNameSchema
EffectSchema
ElementTargetSchema
evaluatePredicate
EventTemplateSchema
EventValueSourceSchema
feedDefinition
FocusEffectScopeSchema
FocusEffectTargetSchema
FocusEffectTriggerSchema
FocusModelSchema
FocusProjectionSchema
getTabsDataDiagnostics
getWindowSplitterDataDiagnostics
gridDefinition
IdRefListSchema
isRegisteredAriaSource
isRegisteredNavigationTarget
isRegisteredPredicate
isRegisteredStateProjection
isRegisteredVisibleOrder
KeyboardBindingSchema
KeyboardCaseSchema
KeySchema
KeyTokenSchema
landmarksDefinition
linkDefinition
listboxDefinition
menubarDefinition
menuButtonDefinition
meterDefinition
NavigationSchema
NavigationTargetKindSchema
NavigationTargetSchema
PartEventBindingSchema
PartSchema
PatternDataSchema
PatternDefinitionSchema
PatternDirectionSchema
PatternEventMetaSchema
PatternEventReasonSchema
PatternEventSchema
PatternEventTypeSchema
PatternItemSchema
PatternOptionsSchema
PatternRefsSchema
PatternRelationsSchema
PatternStateSchema
PatternValueStepDirectionSchema
PredicateSchema
radioGroupDefinition
reducePatternData
reduceWindowSplitterValue
resolveAriaSource
resolveEventTemplate
resolveKeyToken
resolveNavigationTarget
resolveStateProjection
resolveVisibleOrder
resolveWindowSplitterStepValue
resolveWindowSplitterValueRange
sliderDefinition
spinbuttonDefinition
StateActionSchema
StateFieldSchema
StateProjectionSchema
switchDefinition
tableDefinition
tabsDefinition
toolbarDefinition
tooltipDefinition
TransitionSchema
TransitionValueSchema
treegridDefinition
treeviewDefinition
VisibleOrderKindSchema
VisibleOrderSchema
windowSplitterDefinition
```
<!-- apg-api:root-core-runtime:end -->

## React-Only Exports

<!-- apg-api:react-only:start -->
```txt
Accordion
AccordionProps
Alert
AlertDialog
AlertDialogProps
AlertProps
AutocompleteListboxActions
AutocompleteListboxOptions
AutocompleteListboxState
AutocompleteOwnerAutocomplete
Breadcrumb
BreadcrumbProps
Button
ButtonProps
Carousel
CarouselProps
Checkbox
CheckboxProps
Combobox
ComboboxProps
CommandSurfaceDataOptions
CommandSurfaceItem
createMenuButtonPatternData
createRadioGroupPatternData
createToolbarPatternData
Dialog
DialogProps
Disclosure
DisclosureProps
dispatchAutocompleteOwnerKeyDown
Feed
FeedProps
Grid
GridProps
Landmarks
LandmarksProps
Link
LinkProps
Listbox
ListboxProps
Menu
Menubar
MenubarProps
MenuButton
MenuButtonCommandSurfaceDataOptions
MenuButtonProps
MenuProps
Meter
MeterProps
PatternStateReducerOptions
PatternStateReducerResult
RadioGroup
RadioGroupProps
ReactAccordionRenderItem
ReactAccordionRuntime
ReactAlertDialogRuntime
ReactAlertRuntime
ReactAutocompleteListboxRuntime
ReactBreadcrumbItem
ReactBreadcrumbRuntime
ReactButtonRuntime
ReactCarouselRuntime
ReactCarouselSlide
ReactCheckboxRenderItem
ReactCheckboxRuntime
ReactComboboxOption
ReactComboboxRuntime
ReactControlledAlertDialogRuntime
ReactControlledDialogConfig
ReactControlledDialogOpenChangeMeta
ReactControlledDialogRuntime
ReactDialogFocusTarget
ReactDialogRuntime
ReactDisclosureItem
ReactDisclosureRuntime
ReactFeedArticle
ReactFeedRuntime
ReactGridCell
ReactGridRow
ReactGridRuntime
ReactLandmarkItem
ReactLandmarksRuntime
ReactLinkRuntime
ReactListboxRenderItem
ReactListboxRuntime
ReactMenubarItem
ReactMenubarRuntime
ReactMenuButtonRuntime
ReactMenuButtonTriggerState
ReactMenuItem
ReactMenuPatternOptions
ReactMenuRuntime
ReactMeterRenderItem
ReactMeterRuntime
ReactRadioGroupOptions
ReactRadioGroupRuntime
ReactRadioRenderItem
ReactSliderRenderItem
ReactSliderRuntime
ReactSpinbuttonRenderItem
ReactSpinbuttonRuntime
ReactSwitchRenderItem
ReactSwitchRuntime
ReactTableCell
ReactTableRow
ReactTableRuntime
ReactTabsRuntime
ReactToolbarItemKind
ReactToolbarRenderItem
ReactToolbarRuntime
ReactTooltipRuntime
ReactTreegridCell
ReactTreegridRow
ReactTreegridRuntime
ReactTreeviewRenderItem
ReactTreeviewRuntime
ReactWindowSplitterRuntime
SelectableCommandSurfaceDataOptions
Slider
SliderProps
Spinbutton
SpinbuttonProps
Switch
SwitchProps
Table
TableProps
Tabs
TabsProps
Toolbar
ToolbarProps
Tooltip
TooltipProps
Treegrid
TreegridProps
Treeview
TreeviewProps
useAccordionPattern
useAlertDialogPattern
useAlertPattern
useAutocompleteListbox
useBreadcrumbPattern
useButtonPattern
useCarouselPattern
useCheckboxPattern
useComboboxPattern
useControlledAlertDialogPattern
useControlledDialogPattern
useDialogPattern
useDisclosurePattern
useFeedPattern
useGridPattern
useLandmarksPattern
useLinkPattern
useListboxPattern
useMenubarPattern
useMenuButtonPattern
useMenuPattern
useMeterPattern
usePatternStateReducer
useRadioGroupPattern
useSliderPattern
useSpinbuttonPattern
useSwitchPattern
useTablePattern
useTabsPattern
useToolbarPattern
useTooltipPattern
useTreegridPattern
useTreeviewPattern
useWindowSplitterPattern
WindowSplitter
WindowSplitterProps
```
<!-- apg-api:react-only:end -->

## React-Only Runtime Values

<!-- apg-api:react-only-runtime:start -->
```txt
Accordion
Alert
AlertDialog
Breadcrumb
Button
Carousel
Checkbox
Combobox
createMenuButtonPatternData
createRadioGroupPatternData
createToolbarPatternData
Dialog
Disclosure
dispatchAutocompleteOwnerKeyDown
Feed
Grid
Landmarks
Link
Listbox
Menu
Menubar
MenuButton
Meter
RadioGroup
Slider
Spinbutton
Switch
Table
Tabs
Toolbar
Tooltip
Treegrid
Treeview
useAccordionPattern
useAlertDialogPattern
useAlertPattern
useAutocompleteListbox
useBreadcrumbPattern
useButtonPattern
useCarouselPattern
useCheckboxPattern
useComboboxPattern
useControlledAlertDialogPattern
useControlledDialogPattern
useDialogPattern
useDisclosurePattern
useFeedPattern
useGridPattern
useLandmarksPattern
useLinkPattern
useListboxPattern
useMenubarPattern
useMenuButtonPattern
useMenuPattern
useMeterPattern
usePatternStateReducer
useRadioGroupPattern
useSliderPattern
useSpinbuttonPattern
useSwitchPattern
useTablePattern
useTabsPattern
useToolbarPattern
useTooltipPattern
useTreegridPattern
useTreeviewPattern
useWindowSplitterPattern
WindowSplitter
```
<!-- apg-api:react-only-runtime:end -->
