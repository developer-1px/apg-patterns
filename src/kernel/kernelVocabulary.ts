// Token strings used by serializable pattern definitions.
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

export const KeyTokens = {
  key: '$key',                 // item key for the part that emitted the event
  activeKey: '$activeKey',     // data.state.activeKey
  anchorKey: '$anchorKey',     // multi-select anchor
  extentKey: '$extentKey',     // multi-select extent
} as const

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
