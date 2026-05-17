import { PatternDataSchema } from '../../src'

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
