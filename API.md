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

Each line maps `export | bucket`. `npm run check:api` verifies these blocks
against the built declaration files and the taxonomy in
`INTERFACE_STABILITY.md`.

### Root And Core Public Surface

<!-- apg-api:root-core-surface:start -->
```txt
accordionDefinition | apg-pattern-definition
alertDefinition | apg-pattern-definition
alertDialogDefinition | apg-pattern-definition
AriaAttribute | core-contract-type
AriaAttributeSchema | schema-validator
AriaProjection | core-contract-type
AriaProjectionSchema | schema-validator
AriaRole | core-contract-type
AriaRoleSchema | schema-validator
AriaSourcePath | core-contract-type
AriaSourcePathSchema | schema-validator
AriaSourceResolver | extension-resolver-type
breadcrumbDefinition | apg-pattern-definition
buttonDefinition | apg-pattern-definition
carouselDefinition | apg-pattern-definition
checkboxDefinition | apg-pattern-definition
clampWindowSplitterValue | runtime-boundary
comboboxDefinition | apg-pattern-definition
createParentByKey | runtime-boundary
createPatternRuntime | runtime-boundary
CreatePatternRuntimeInput | core-contract-type
defineAriaSource | extension-vocabulary
defineDomEvent | extension-vocabulary
defineKeyToken | extension-vocabulary
defineNavigationTarget | extension-vocabulary
definePredicate | extension-vocabulary
defineStateProjection | extension-vocabulary
defineVisibleOrder | extension-vocabulary
dialogDefinition | apg-pattern-definition
disclosureDefinition | apg-pattern-definition
DomEventName | core-contract-type
DomEventNameSchema | schema-validator
EffectDefinition | core-contract-type
EffectSchema | schema-validator
ElementTarget | core-contract-type
ElementTargetSchema | schema-validator
evaluatePredicate | runtime-boundary
EventTemplate | core-contract-type
EventTemplateSchema | schema-validator
EventValueSource | core-contract-type
EventValueSourceSchema | schema-validator
feedDefinition | apg-pattern-definition
FocusEffectScopeSchema | schema-validator
FocusEffectTargetSchema | schema-validator
FocusEffectTriggerSchema | schema-validator
FocusModel | core-contract-type
FocusModelSchema | schema-validator
FocusProjection | core-contract-type
FocusProjectionSchema | schema-validator
getTabsDataDiagnostics | runtime-boundary
getWindowSplitterDataDiagnostics | runtime-boundary
gridDefinition | apg-pattern-definition
IdRefListSchema | schema-validator
isRegisteredAriaSource | extension-vocabulary
isRegisteredNavigationTarget | extension-vocabulary
isRegisteredPredicate | extension-vocabulary
isRegisteredStateProjection | extension-vocabulary
isRegisteredVisibleOrder | extension-vocabulary
Key | core-contract-type
KeyboardBinding | core-contract-type
KeyboardBindingSchema | schema-validator
KeyboardCaseSchema | schema-validator
KeyInput | core-contract-type
KeySchema | schema-validator
KeyTokenSchema | schema-validator
landmarksDefinition | apg-pattern-definition
linkDefinition | apg-pattern-definition
listboxDefinition | apg-pattern-definition
menubarDefinition | apg-pattern-definition
menuButtonDefinition | apg-pattern-definition
meterDefinition | apg-pattern-definition
ModifierKeyName | core-contract-type
NavigationSchema | schema-validator
NavigationTargetContext | core-contract-type
NavigationTargetKind | core-contract-type
NavigationTargetKindSchema | schema-validator
NavigationTargetResolver | extension-resolver-type
NavigationTargetSchema | schema-validator
PartEventBinding | core-contract-type
PartEventBindingSchema | schema-validator
PartSchema | schema-validator
PatternData | core-contract-type
PatternDataSchema | schema-validator
PatternDefinition | core-contract-type
PatternDefinitionSchema | schema-validator
PatternDirection | core-contract-type
PatternDirectionSchema | schema-validator
PatternEvent | core-contract-type
PatternEventMetaSchema | schema-validator
PatternEventReason | core-contract-type
PatternEventReasonSchema | schema-validator
PatternEventSchema | schema-validator
PatternEventType | core-contract-type
PatternEventTypeSchema | schema-validator
PatternItem | core-contract-type
PatternItemSchema | schema-validator
PatternOptions | core-contract-type
PatternOptionsSchema | schema-validator
PatternRefsSchema | schema-validator
PatternRelationsSchema | schema-validator
PatternRuntime | core-contract-type
PatternRuntimeContext | core-contract-type
PatternState | core-contract-type
PatternStateSchema | schema-validator
PatternValueStepDirection | core-contract-type
PatternValueStepDirectionSchema | schema-validator
Predicate | core-contract-type
PredicateResolver | extension-resolver-type
PredicateSchema | schema-validator
radioGroupDefinition | apg-pattern-definition
reducePatternData | runtime-boundary
reduceWindowSplitterValue | runtime-boundary
resolveAriaSource | runtime-boundary
resolveEventTemplate | runtime-boundary
resolveKeyToken | runtime-boundary
resolveNavigationTarget | runtime-boundary
resolveStateProjection | runtime-boundary
resolveVisibleOrder | runtime-boundary
resolveWindowSplitterStepValue | runtime-boundary
resolveWindowSplitterValueRange | runtime-boundary
sliderDefinition | apg-pattern-definition
SlotProps | core-contract-type
spinbuttonDefinition | apg-pattern-definition
StateAction | core-contract-type
StateActionSchema | schema-validator
StateField | core-contract-type
StateFieldSchema | schema-validator
StateProjection | core-contract-type
StateProjectionResolver | extension-resolver-type
StateProjectionSchema | schema-validator
switchDefinition | apg-pattern-definition
tableDefinition | apg-pattern-definition
TabsDataDiagnostic | core-contract-type
TabsDataDiagnosticCode | core-contract-type
tabsDefinition | apg-pattern-definition
toolbarDefinition | apg-pattern-definition
tooltipDefinition | apg-pattern-definition
Transition | core-contract-type
TransitionSchema | schema-validator
TransitionValue | core-contract-type
TransitionValueSchema | schema-validator
treegridDefinition | apg-pattern-definition
treeviewDefinition | apg-pattern-definition
VisibleOrderKind | core-contract-type
VisibleOrderKindSchema | schema-validator
VisibleOrderResolver | extension-resolver-type
VisibleOrderSchema | schema-validator
WindowSplitterDataDiagnostic | core-contract-type
WindowSplitterDataDiagnosticCode | core-contract-type
windowSplitterDefinition | apg-pattern-definition
WindowSplitterValueData | core-contract-type
WindowSplitterValueOptions | core-contract-type
WindowSplitterValueRange | core-contract-type
WindowSplitterValueState | core-contract-type
```
<!-- apg-api:root-core-surface:end -->

### React-Only Public Surface

<!-- apg-api:react-only-surface:start -->
```txt
Accordion | react-preset-component
AccordionProps | react-preset-props
Alert | react-preset-component
AlertDialog | react-preset-component
AlertDialogProps | react-preset-props
AlertProps | react-preset-props
AutocompleteListboxActions | react-owner-adapter
AutocompleteListboxOptions | react-owner-adapter
AutocompleteListboxState | react-owner-adapter
AutocompleteOwnerAutocomplete | react-owner-adapter
Breadcrumb | react-preset-component
BreadcrumbProps | react-preset-props
Button | react-preset-component
ButtonProps | react-preset-props
Carousel | react-preset-component
CarouselProps | react-preset-props
Checkbox | react-preset-component
CheckboxProps | react-preset-props
Combobox | react-preset-component
ComboboxProps | react-preset-props
CommandSurfaceDataOptions | react-data-helper
CommandSurfaceItem | react-data-helper
createMenuButtonPatternData | react-data-helper
createRadioGroupPatternData | react-data-helper
createToolbarPatternData | react-data-helper
Dialog | react-preset-component
DialogProps | react-preset-props
Disclosure | react-preset-component
DisclosureProps | react-preset-props
dispatchAutocompleteOwnerKeyDown | react-owner-adapter
Feed | react-preset-component
FeedProps | react-preset-props
Grid | react-preset-component
GridProps | react-preset-props
Landmarks | react-preset-component
LandmarksProps | react-preset-props
Link | react-preset-component
LinkProps | react-preset-props
Listbox | react-preset-component
ListboxProps | react-preset-props
Menu | react-preset-component
Menubar | react-preset-component
MenubarProps | react-preset-props
MenuButton | react-preset-component
MenuButtonCommandSurfaceDataOptions | react-data-helper
MenuButtonProps | react-preset-props
MenuProps | react-preset-props
Meter | react-preset-component
MeterProps | react-preset-props
PatternStateReducerOptions | react-state-helper
PatternStateReducerResult | react-state-helper
RadioGroup | react-preset-component
RadioGroupProps | react-preset-props
ReactAccordionRenderItem | react-render-surface-type
ReactAccordionRuntime | react-runtime-type
ReactAlertDialogRuntime | react-runtime-type
ReactAlertRuntime | react-runtime-type
ReactAutocompleteListboxRuntime | react-runtime-type
ReactBreadcrumbItem | react-render-surface-type
ReactBreadcrumbRuntime | react-runtime-type
ReactButtonRuntime | react-runtime-type
ReactCarouselRuntime | react-runtime-type
ReactCarouselSlide | react-render-surface-type
ReactCheckboxRenderItem | react-render-surface-type
ReactCheckboxRuntime | react-runtime-type
ReactComboboxOption | react-render-surface-type
ReactComboboxRuntime | react-runtime-type
ReactControlledAlertDialogRuntime | react-runtime-type
ReactControlledDialogConfig | react-state-helper
ReactControlledDialogOpenChangeMeta | react-state-helper
ReactControlledDialogRuntime | react-runtime-type
ReactDialogFocusTarget | react-state-helper
ReactDialogRuntime | react-runtime-type
ReactDisclosureItem | react-render-surface-type
ReactDisclosureRuntime | react-runtime-type
ReactFeedArticle | react-render-surface-type
ReactFeedRuntime | react-runtime-type
ReactGridCell | react-render-surface-type
ReactGridRow | react-render-surface-type
ReactGridRuntime | react-runtime-type
ReactLandmarkItem | react-render-surface-type
ReactLandmarksRuntime | react-runtime-type
ReactLinkRuntime | react-runtime-type
ReactListboxRenderItem | react-render-surface-type
ReactListboxRuntime | react-runtime-type
ReactMenubarItem | react-render-surface-type
ReactMenubarRuntime | react-runtime-type
ReactMenuButtonRuntime | react-runtime-type
ReactMenuButtonTriggerState | react-data-helper
ReactMenuItem | react-render-surface-type
ReactMenuPatternOptions | react-runtime-type
ReactMenuRuntime | react-runtime-type
ReactMeterRenderItem | react-render-surface-type
ReactMeterRuntime | react-runtime-type
ReactRadioGroupOptions | react-runtime-type
ReactRadioGroupRuntime | react-runtime-type
ReactRadioRenderItem | react-render-surface-type
ReactSliderRenderItem | react-render-surface-type
ReactSliderRuntime | react-runtime-type
ReactSpinbuttonRenderItem | react-render-surface-type
ReactSpinbuttonRuntime | react-runtime-type
ReactSwitchRenderItem | react-render-surface-type
ReactSwitchRuntime | react-runtime-type
ReactTableCell | react-render-surface-type
ReactTableRow | react-render-surface-type
ReactTableRuntime | react-runtime-type
ReactTabsRuntime | react-runtime-type
ReactToolbarItemKind | react-data-helper
ReactToolbarRenderItem | react-render-surface-type
ReactToolbarRuntime | react-runtime-type
ReactTooltipRuntime | react-runtime-type
ReactTreegridCell | react-render-surface-type
ReactTreegridRow | react-render-surface-type
ReactTreegridRuntime | react-runtime-type
ReactTreeviewRenderItem | react-render-surface-type
ReactTreeviewRuntime | react-runtime-type
ReactWindowSplitterRuntime | react-runtime-type
SelectableCommandSurfaceDataOptions | react-data-helper
Slider | react-preset-component
SliderProps | react-preset-props
Spinbutton | react-preset-component
SpinbuttonProps | react-preset-props
Switch | react-preset-component
SwitchProps | react-preset-props
Table | react-preset-component
TableProps | react-preset-props
Tabs | react-preset-component
TabsProps | react-preset-props
Toolbar | react-preset-component
ToolbarProps | react-preset-props
Tooltip | react-preset-component
TooltipProps | react-preset-props
Treegrid | react-preset-component
TreegridProps | react-preset-props
Treeview | react-preset-component
TreeviewProps | react-preset-props
useAccordionPattern | react-pattern-hook
useAlertDialogPattern | react-pattern-hook
useAlertPattern | react-pattern-hook
useAutocompleteListbox | react-owner-adapter
useBreadcrumbPattern | react-pattern-hook
useButtonPattern | react-pattern-hook
useCarouselPattern | react-pattern-hook
useCheckboxPattern | react-pattern-hook
useComboboxPattern | react-pattern-hook
useControlledAlertDialogPattern | react-pattern-hook
useControlledDialogPattern | react-pattern-hook
useDialogPattern | react-pattern-hook
useDisclosurePattern | react-pattern-hook
useFeedPattern | react-pattern-hook
useGridPattern | react-pattern-hook
useLandmarksPattern | react-pattern-hook
useLinkPattern | react-pattern-hook
useListboxPattern | react-pattern-hook
useMenubarPattern | react-pattern-hook
useMenuButtonPattern | react-pattern-hook
useMenuPattern | react-pattern-hook
useMeterPattern | react-pattern-hook
usePatternStateReducer | react-state-helper
useRadioGroupPattern | react-pattern-hook
useSliderPattern | react-pattern-hook
useSpinbuttonPattern | react-pattern-hook
useSwitchPattern | react-pattern-hook
useTablePattern | react-pattern-hook
useTabsPattern | react-pattern-hook
useToolbarPattern | react-pattern-hook
useTooltipPattern | react-pattern-hook
useTreegridPattern | react-pattern-hook
useTreeviewPattern | react-pattern-hook
useWindowSplitterPattern | react-pattern-hook
WindowSplitter | react-preset-component
WindowSplitterProps | react-preset-props
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
