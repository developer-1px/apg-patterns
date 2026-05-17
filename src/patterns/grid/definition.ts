import { moveGrid } from '@interactive-os/keyboard-navigation'
import { PatternDefinitionSchema } from '../../schema'
import { defineNavigationTarget, defineVisibleOrder } from '../../patternKernel'
import type { Key, PatternData } from '../../schema'

type GridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

export const gridRows = (data: PatternData): readonly (readonly Key[])[] =>
  (data.relations?.rowKeys ?? []).map((rowKey) =>
    (data.relations?.columnKeys ?? [])
      .map((columnKey) => data.relations?.cells?.find((cell) => cell.rowKey === rowKey && cell.columnKey === columnKey)?.cellKey)
      .filter((cellKey): cellKey is Key => Boolean(cellKey)),
  )

defineVisibleOrder('gridRows', (_visibleOrder, data) => gridRows(data).flat())

defineNavigationTarget('gridCell', (target, ctx) => {
  const action = target.action
  if (
    action !== 'left' &&
    action !== 'right' &&
    action !== 'up' &&
    action !== 'down' &&
    action !== 'rowStart' &&
    action !== 'rowEnd' &&
    action !== 'gridStart' &&
    action !== 'gridEnd'
  ) {
    throw new Error(`Unsupported grid action: ${String(action)}`)
  }
  return moveGrid(gridRows(ctx.data), ctx.activeKey, action as GridAction)
})

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
  parts: {
    grid: {
      role: 'grid',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      ],
    },
    row: {
      role: 'row',
      keySource: 'relations.rowKeys',
      aria: [{ attribute: 'aria-rowindex', from: 'state.rowIndexByKey' }],
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
      events: cellEvents,
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
  ],
})
