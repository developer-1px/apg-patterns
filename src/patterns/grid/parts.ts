const cellFocus = {
  tabIndex: {
    when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
    active: 0,
    inactive: -1,
  },
} as const

const cellEvents = [
  { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
  { event: 'click', events: [{ type: 'select', key: '$key' }] },
] as const

export const gridParts = {
  grid: {
    role: 'grid',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      { attribute: 'aria-rowcount', from: 'state.rowCount' },
      { attribute: 'aria-colcount', from: 'state.colCount' },
      { attribute: 'aria-readonly', from: 'state.readonly' },
      { attribute: 'aria-multiselectable', from: 'state.multiselectable' },
    ],
  },
  row: {
    role: 'row',
    aria: [{ attribute: 'aria-rowindex', from: 'state.rowIndexByKey' }],
  },
  gridcell: {
    role: 'gridcell',
    aria: [
      { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
      { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
      { attribute: 'aria-selected', from: 'state.selectedKeys' },
    ],
    focus: cellFocus,
    events: cellEvents,
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'selected', from: 'state.selectedKeys' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
  },
  rowheader: {
    role: 'rowheader',
    aria: [
      { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
      { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
      { attribute: 'aria-selected', from: 'state.selectedKeys' },
    ],
    focus: cellFocus,
    events: cellEvents,
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'selected', from: 'state.selectedKeys' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
  },
  columnheader: {
    role: 'columnheader',
    aria: [
      { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
      { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
      { attribute: 'aria-sort', from: 'state.sortByKey' },
    ],
    focus: cellFocus,
    events: [
      { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', events: [{ type: 'activate', key: '$key' }] },
    ],
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'selected', from: 'state.selectedKeys' },
    ],
  },
} as const
