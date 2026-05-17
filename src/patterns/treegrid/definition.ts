import { PatternDefinitionSchema } from '../../schema'
import './navigation'

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

const activeAtFirstCol = { kind: 'extension', name: 'treegridActiveAtFirstColumn' } as const
const activeRowHasChildren = { kind: 'extension', name: 'treegridActiveRowHasChildren' } as const
const activeRowIsExpanded = { kind: 'extension', name: 'treegridActiveRowIsExpanded' } as const

export const treegridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'treegrid',
  rootRole: 'treegrid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  parts: {
    treegrid: {
      role: 'treegrid',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-rowcount', from: 'state.treegridRowCount' },
        { attribute: 'aria-colcount', from: 'state.treegridColCount' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      ],
    },
    row: {
      role: 'row',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-level', from: 'state.rowLevelByKey' },
        { attribute: 'aria-expanded', from: 'state.rowExpanded' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
      ],
      state: [
        { name: 'expanded', from: 'state.expandedKeys' },
        { name: 'selected', from: 'state.selectedKeys' },
      ],
    },
    gridcell: {
      role: 'gridcell',
      keySource: 'gridCellKey',
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
      keySource: 'columnHeaderKey',
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
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeAtFirstCol, activeRowHasChildren, { kind: 'not', predicate: activeRowIsExpanded }] },
        events: [{ type: 'expand', key: '$activeRowKey', expanded: true }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'right' }] },
    ] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeAtFirstCol, activeRowHasChildren, activeRowIsExpanded] },
        events: [{ type: 'expand', key: '$activeRowKey', expanded: false }],
      },
      {
        case: 'when',
        when: activeAtFirstCol,
        events: [{ type: 'navigate', direction: 'parentRow' }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'left' }] },
    ] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'down' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'up' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowStart' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowEnd' }] }] },
    { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridStart' }] }] },
    { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridEnd' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  ],
})
