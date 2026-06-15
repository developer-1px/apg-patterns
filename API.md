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
