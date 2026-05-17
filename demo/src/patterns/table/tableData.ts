import { PatternDataSchema } from '../../../../src'

type TableCellSpec = {
  key: string
  label: string
  kind?: 'columnheader' | 'rowheader'
  sort?: 'ascending' | 'descending' | 'other'
}

const cell = (key: string, label: string): TableCellSpec => ({ key, label })
const header = (key: string, label: string, sort?: TableCellSpec['sort']): TableCellSpec => ({ key, label, kind: 'columnheader', sort })
const rowHead = (key: string, label: string): TableCellSpec => ({ key, label, kind: 'rowheader' })

const tableData = (input: {
  label: string
  rows: readonly (readonly TableCellSpec[])[]
}) => {
  const maxColumns = Math.max(...input.rows.map((row) => row.length))
  const rowKeys = input.rows.map((_row, index) => `row${index + 1}`)
  const columnKeys = Array.from({ length: maxColumns }, (_v, index) => `col${index + 1}`)
  const rowIndexByKey: Record<string, number> = Object.fromEntries(rowKeys.map((k, i) => [k, i + 1]))
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
      rowIndexByKey,
      columnIndexByKey,
      rowCount: rowKeys.length,
      colCount: columnKeys.length,
      ...(Object.keys(sortByKey).length ? { sortByKey } : {}),
    },
    refs: { label: input.label },
  })
}

export const tableVariants = {
  basic: {
    label: 'Basic transactions',
    data: tableData({
      label: 'Transactions',
      rows: [
        [header('hDate', 'Date', 'ascending'), header('hType', 'Type'), header('hAmount', 'Amount')],
        [rowHead('r1Date', '2026-05-01'), cell('r1Type', 'Deposit'), cell('r1Amount', '$125.00')],
        [rowHead('r2Date', '2026-05-02'), cell('r2Type', 'Payment'), cell('r2Amount', '$32.00')],
        [rowHead('r3Date', '2026-05-03'), cell('r3Type', 'Deposit'), cell('r3Amount', '$210.00')],
      ],
    }),
  },
} as const

export type TableVariantKey = keyof typeof tableVariants
export const initialTableData = tableVariants.basic.data
