import { PatternDefinitionSchema } from '../../schema'
import './navigation'

export { gridRows } from './navigation'

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

export const gridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'grid',
  rootRole: 'grid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
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
  },
  navigation: {
    visibleOrder: { kind: 'gridRows' },
    targets: {
      left: { kind: 'gridCell', action: 'left' },
      right: { kind: 'gridCell', action: 'right' },
      up: { kind: 'gridCell', action: 'up' },
      down: { kind: 'gridCell', action: 'down' },
      rowStart: { kind: 'gridCell', action: 'rowStart' },
      rowEnd: { kind: 'gridCell', action: 'rowEnd' },
      gridStart: { kind: 'gridCell', action: 'gridStart' },
      gridEnd: { kind: 'gridCell', action: 'gridEnd' },
      pageUp: { kind: 'gridPage', action: 'pageUp' },
      pageDown: { kind: 'gridPage', action: 'pageDown' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'right' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'left' }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'down' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'up' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowStart' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowEnd' }] }] },
    { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridStart' }] }] },
    { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridEnd' }] }] },
    { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageUp' }] }] },
    { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageDown' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'F2', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'Escape', preventDefault: false, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
  ],
  transitions: [
    {
      on: 'editStart',
      actions: [
        { kind: 'set', field: 'editingKey', value: { from: '$event.key' } },
        { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.value' } },
      ],
    },
    {
      on: 'editDraft',
      actions: [
        { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.value' } },
      ],
    },
    {
      on: 'editEnd',
      actions: [{ kind: 'set', field: 'editingKey', value: { literal: null } }],
    },
  ],
})
