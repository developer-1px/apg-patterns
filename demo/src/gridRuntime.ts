import { moveGrid } from '@interactive-os/keyboard-navigation'
import {
  PatternDataSchema,
  PatternDefinitionSchema,
  defineNavigationTarget,
  defineVisibleOrder,
  type Key,
  type PatternData,
} from '../../src'

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

type GridCellSpec = {
  key: string
  label: string
  kind?: 'columnheader'
  sort?: 'ascending' | 'descending' | 'other'
}

const cell = (key: string, label: string, options: Omit<GridCellSpec, 'key' | 'label'> = {}): GridCellSpec => ({ key, label, ...options })
const header = (key: string, label: string, sort?: GridCellSpec['sort']): GridCellSpec => cell(key, label, { kind: 'columnheader', sort })

const gridData = (input: {
  label: string
  activeKey: string
  rows: readonly (readonly GridCellSpec[])[]
}) => {
  const maxColumns = Math.max(...input.rows.map((row) => row.length))
  const rowKeys = input.rows.map((_row, index) => `row${index + 1}`)
  const columnKeys = Array.from({ length: maxColumns }, (_value, index) => `col${index + 1}`)
  const rowIndexByKey = Object.fromEntries(rowKeys.map((key, index) => [key, index + 1]))
  const columnIndexByKey: Record<string, number> = {}
  const sortByKey: Record<string, 'ascending' | 'descending' | 'other'> = {}
  const items = Object.fromEntries([
    ...rowKeys.map((key, index) => [key, { label: `Row ${index + 1}` }]),
    ...columnKeys.map((key, index) => [key, { label: `Column ${index + 1}` }]),
    ...input.rows.flatMap((row, rowIndex) =>
      row.map((spec, columnIndex) => {
        rowIndexByKey[spec.key] = rowIndex + 1
        columnIndexByKey[spec.key] = columnIndex + 1
        if (spec.sort) sortByKey[spec.key] = spec.sort
        return [spec.key, { label: spec.label, kind: spec.kind }]
      }),
    ),
  ])

  return PatternDataSchema.parse({
    items,
    relations: {
      rowKeys,
      columnKeys,
      cells: input.rows.flatMap((row, rowIndex) =>
        row.map((spec, columnIndex) => ({
          rowKey: rowKeys[rowIndex],
          columnKey: columnKeys[columnIndex],
          cellKey: spec.key,
        })),
      ),
    },
    state: {
      activeKey: input.activeKey,
      selectedKeys: [input.activeKey],
      rowIndexByKey,
      columnIndexByKey,
      ...(Object.keys(sortByKey).length ? { sortByKey } : {}),
    },
    refs: { label: input.label },
  })
}

export const gridVariants = {
  layoutLinks: {
    label: 'Layout links',
    data: gridData({
      label: 'Related Documents',
      activeKey: 'aria',
      rows: [
        [cell('aria', 'ARIA 1.1'), cell('core', 'Core AAM 1.1'), cell('wai', 'WAI-ARIA Overview')],
        [cell('wcag', 'WCAG Overview'), cell('html', 'HTML'), cell('svg', 'SVG 2')],
      ],
    }),
  },
  layoutButtons: {
    label: 'Layout buttons',
    data: gridData({
      label: 'Media controls',
      activeKey: 'play',
      rows: [
        [cell('prev', 'Previous'), cell('play', 'Play'), cell('next', 'Next')],
        [cell('rewind', 'Rewind'), cell('pause', 'Pause'), cell('forward', 'Forward')],
      ],
    }),
  },
  dataTransactions: {
    label: 'Data table',
    data: gridData({
      label: 'Transactions',
      activeKey: 'c12',
      rows: [
        [header('hDate', 'Date', 'ascending'), header('hType', 'Type'), header('hAmount', 'Amount')],
        [cell('c11', '2026-05-01'), cell('c12', 'Deposit'), cell('c13', '$125.00')],
        [cell('c21', '2026-05-02'), cell('c22', 'Payment'), cell('c23', '$32.00')],
      ],
    }),
  },
  dataSortable: {
    label: 'Sortable',
    data: gridData({
      label: 'Sortable planets',
      activeKey: 'hName',
      rows: [
        [header('hName', 'Name', 'ascending'), header('hDistance', 'Distance'), header('hType', 'Type')],
        [cell('mercury', 'Mercury'), cell('mercuryDistance', '57.9'), cell('mercuryType', 'Terrestrial')],
        [cell('venus', 'Venus'), cell('venusDistance', '108.2'), cell('venusType', 'Terrestrial')],
      ],
    }),
  },
} as const

export type GridVariantKey = keyof typeof gridVariants
export const gridVariantItems = Object.entries(gridVariants).map(([key, value]) => ({ key: key as GridVariantKey, label: value.label }))
export const initialGridData = gridVariants.dataTransactions.data
