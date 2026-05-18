import { PatternDefinitionSchema } from '../../schema'
import { treegridKeyboard } from './keyboard'
import './navigation'

export { treegridVisibleRowKeys, treegridVisibleCells } from './navigation'

const rowFocusMode = { kind: 'optionEquals', option: 'focusMode', value: 'row' } as const

const cellFocus = {
  tabIndex: {
    when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
    active: 0,
    inactive: -1,
  },
} as const

const rowFocus = {
  tabIndex: {
    when: { kind: 'all', predicates: [
      { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
      rowFocusMode,
    ] },
    active: 0,
    inactive: -1,
  },
} as const

const cellEvents = [
  { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
  { event: 'click', events: [{ type: 'select', key: '$key' }] },
] as const

const rowEvents = [
  { event: 'focus', when: rowFocusMode, events: [{ type: 'focus', key: '$key' }] },
  { event: 'click', when: rowFocusMode, events: [{ type: 'select', key: '$key' }] },
] as const

export const treegridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'treegrid',
  rootRole: 'treegrid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    treegrid: {
      role: 'treegrid',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-rowcount', from: 'state.rowCount' },
        { attribute: 'aria-colcount', from: 'state.colCount' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
        { attribute: 'aria-readonly', from: 'state.readonly' },
      ],
    },
    row: {
      role: 'row',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-level', from: 'state.levelByKey' },
        { attribute: 'aria-expanded', from: 'state.rowExpanded' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
      ],
      focus: rowFocus,
      events: rowEvents,
      state: [
        { name: 'expanded', from: 'state.expandedKeys' },
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'active', from: 'state.activeKey' },
      ],
    },
    gridcell: {
      role: 'gridcell',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-readonly', from: 'state.readonly' },
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
      state: [{ name: 'active', from: 'state.activeKey' }],
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
  },
  navigation: {
    visibleOrder: { kind: 'treegridVisibleCells' },
    targets: {
      left: { kind: 'treegridCell', action: 'left' },
      right: { kind: 'treegridCell', action: 'right' },
      up: { kind: 'treegridCell', action: 'up' },
      down: { kind: 'treegridCell', action: 'down' },
      rowStart: { kind: 'treegridCell', action: 'rowStart' },
      rowEnd: { kind: 'treegridCell', action: 'rowEnd' },
      gridStart: { kind: 'treegridCell', action: 'gridStart' },
      gridEnd: { kind: 'treegridCell', action: 'gridEnd' },
      parentRow: { kind: 'treegridParentRowFirstCell' },
      pageDown: { kind: 'treegridPage', direction: 'down' },
      pageUp: { kind: 'treegridPage', direction: 'up' },
      rowUp: { kind: 'treegridRow', action: 'up' },
      rowDown: { kind: 'treegridRow', action: 'down' },
      rowGridStart: { kind: 'treegridRow', action: 'gridStart' },
      rowGridEnd: { kind: 'treegridRow', action: 'gridEnd' },
      rowPageDown: { kind: 'treegridRowPage', direction: 'down' },
      rowPageUp: { kind: 'treegridRowPage', direction: 'up' },
    },
  },
  keyboard: treegridKeyboard,
})
