/**
 * Type-safe constants for the token vocabulary registered by the kernel.
 *
 * Rationale:
 *   - Token sets stay open through `z.string()`, so invented names can fragment
 *     the vocabulary. For example, `menu.firstChild` duplicated the existing
 *     unscoped `firstChild` token from the kernel/treeview surface.
 *   - Importing these constants gives callers IDE autocomplete, typo guards,
 *     and one canonical vocabulary.
 *
 * Example:
 *   import { AriaSources, NavigationTargets, Directions } from './kernelVocabulary'
 *   { attribute: 'aria-label', from: AriaSources.refs.label }
 *   { kind: NavigationTargets.linear, action: Directions.next }
 *
 * When a new token is registered, add a constant here as the canonical
 * vocabulary. A registered token without a constant is harder for other
 * patterns to discover.
 */

// AriaSource tokens used to derive ARIA attribute values for parts.
export const AriaSources = {
  refs: {
    label: 'refs.label',
    labelledBy: 'refs.labelledBy',
  },
  items: {
    label: 'items.label',
    labelledBy: 'items.labelledBy',
  },
  relations: {
    controlsByKey: 'relations.controlsByKey',
    ownerByKey: 'relations.ownerByKey',
  },
  state: {
    selectedKeys: 'state.selectedKeys',
    disabledKeys: 'state.disabledKeys',
    expandedKeys: 'state.expandedKeys',
    activeKeyElementId: 'state.activeKey.elementId',
    checkedByKey: 'state.checkedByKey',
    pressedByKey: 'state.pressedByKey',
    levelByKey: 'state.levelByKey',
    posInSetByKey: 'state.posInSetByKey',
    setSizeByKey: 'state.setSizeByKey',
    rowIndexByKey: 'state.rowIndexByKey',
    columnIndexByKey: 'state.columnIndexByKey',
    sortByKey: 'state.sortByKey',
  },
  options: {
    orientation: 'options.orientation',
    selectionModeMultiple: 'options.selectionMode.multiple',
  },
} as const

// StateProjection.from tokens used to derive render state for parts.
export const StateSources = {
  activeKey: 'state.activeKey',
  selectedKeys: 'state.selectedKeys',
  disabledKeys: 'state.disabledKeys',
  expandedKeys: 'state.expandedKeys',
  checkedByKey: 'state.checkedByKey',
} as const

// NavigationTarget.kind tokens registered by the kernel.
export const NavigationTargets = {
  linear: 'linear',          // next/previous/first/last over visibleKeys
  firstChild: 'firstChild',  // first child item for tree patterns
  parentKey: 'parentKey',    // parent item for tree patterns
} as const

// VisibleOrder.kind tokens registered by the kernel.
export const VisibleOrders = {
  flat: 'flat',                          // flat traversal over relations.rootKeys
  treeVisibleDepthFirst: 'treeVisibleDepthFirst', // tree depth-first traversal
} as const

// PatternDirection tokens for navigate events.
// These are the standard verbs recognized by the kernel's 'linear' target.
// Pattern-specific directions such as pageUp or increment may be added, but
// shared meanings should become constants here and resolver behavior elsewhere.
export const Directions = {
  next: 'next',
  previous: 'previous',
  first: 'first',
  last: 'last',
  child: 'child',
  parent: 'parent',
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
} as const

// KeyToken placeholders used inside EventTemplate and Predicate values.
export const KeyTokens = {
  key: '$key',                 // item key for the part that emitted the event
  activeKey: '$activeKey',     // data.state.activeKey
  anchorKey: '$anchorKey',     // multi-select anchor
  extentKey: '$extentKey',     // multi-select extent
} as const

// PartEventBinding.event DOM event names mapped to React handler props.
export const DomEvents = {
  focus: 'focus',
  blur: 'blur',
  click: 'click',
  dblclick: 'dblclick',
  keydown: 'keydown',
  keyup: 'keyup',
  input: 'input',
  change: 'change',
  mousedown: 'mousedown',
  pointerdown: 'pointerdown',
  pointerup: 'pointerup',
  pointermove: 'pointermove',
  mouseenter: 'mouseenter',
  mouseleave: 'mouseleave',
} as const
