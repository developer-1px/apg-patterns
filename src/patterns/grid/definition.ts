import { moveGrid } from '@interactive-os/collection-navigation'
import { PatternDefinitionSchema } from '../../schema'
import { defineAriaSource, defineNavigationTarget, defineVisibleOrder } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'

type GridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'
type GridPageAction = 'pageUp' | 'pageDown'
const PAGE_SIZE = 5

export const gridRows = (data: PatternData): readonly (readonly Key[])[] =>
  (data.relations?.rowKeys ?? []).map((rowKey) =>
    (data.relations?.columnKeys ?? [])
      .map((columnKey) => data.relations?.cells?.find((cell) => cell.rowKey === rowKey && cell.columnKey === columnKey)?.cellKey)
      .filter((cellKey): cellKey is Key => Boolean(cellKey)),
  )

defineVisibleOrder('gridRows', (_visibleOrder, data) => gridRows(data).flat())

defineAriaSource('state.rowCount', (ctx) => (ctx.data.state as { rowCount?: number } | undefined)?.rowCount ?? ctx.data.relations?.rowKeys?.length)
defineAriaSource('state.colCount', (ctx) => (ctx.data.state as { colCount?: number } | undefined)?.colCount ?? ctx.data.relations?.columnKeys?.length)
defineAriaSource('state.readonly', (ctx) => (ctx.data.state as { readonly?: boolean } | undefined)?.readonly || undefined)
defineAriaSource('state.multiselectable', (ctx) =>
  ctx.options?.selectionMode === 'multiple' || (ctx.data.state as { multiselectable?: boolean } | undefined)?.multiselectable || undefined,
)

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

defineNavigationTarget('gridPage', (target, ctx) => {
  const action = target.action as GridPageAction
  if (action !== 'pageUp' && action !== 'pageDown') {
    throw new Error(`Unsupported grid page action: ${String(action)}`)
  }
  const rows = gridRows(ctx.data)
  let location: { rowIndex: number; columnIndex: number } | null = null
  for (let r = 0; r < rows.length; r += 1) {
    const c = rows[r]!.indexOf(ctx.activeKey)
    if (c >= 0) {
      location = { rowIndex: r, columnIndex: c }
      break
    }
  }
  if (!location) return null
  const delta = action === 'pageDown' ? PAGE_SIZE : -PAGE_SIZE
  const targetRowIndex = Math.max(0, Math.min(rows.length - 1, location.rowIndex + delta))
  const targetRow = rows[targetRowIndex] ?? []
  return targetRow[Math.min(location.columnIndex, targetRow.length - 1)] ?? null
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
        { attribute: 'aria-rowcount', from: 'state.rowCount' },
        { attribute: 'aria-colcount', from: 'state.colCount' },
        { attribute: 'aria-readonly', from: 'state.readonly' },
        { attribute: 'aria-multiselectable', from: 'state.multiselectable' },
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
      on: 'extension',
      name: 'gridEditStart',
      actions: [
        { kind: 'set', field: 'editingKey', value: { from: '$event.key' } },
        { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.payload.value' } },
      ],
    },
    {
      on: 'extension',
      name: 'gridEditDraft',
      actions: [
        { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.payload.value' } },
      ],
    },
    {
      on: 'extension',
      name: 'gridEditEnd',
      actions: [{ kind: 'set', field: 'editingKey', value: { literal: null } }],
    },
  ],
})
