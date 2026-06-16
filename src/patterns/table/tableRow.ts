import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactTableCell {
  key: Key
  label: string
  kind: string
  tag: 'td' | 'th'
  cellProps: ReactPatternProps
}

export interface ReactTableRow {
  key: Key
  rowProps: ReactPatternProps
  cells: readonly ReactTableCell[]
}

export function createTableRows(runtime: PatternRuntime): readonly ReactTableRow[] {
  const rowKeys = runtime.data.relations?.rowKeys ?? []
  const cellKeysByRow = new Map<Key, Key[]>()
  for (const cell of runtime.data.relations?.cells ?? []) {
    const cellKeys = cellKeysByRow.get(cell.rowKey)
    if (cellKeys) cellKeys.push(cell.cellKey)
    else cellKeysByRow.set(cell.rowKey, [cell.cellKey])
  }
  return rowKeys.map((rowKey) => {
    const cellKeys = cellKeysByRow.get(rowKey) ?? []
    return {
      key: rowKey,
      rowProps: reactProps(runtime.getPartProps('row', rowKey)),
      cells: cellKeys.map((cellKey) => {
        const kind = runtime.data.items[cellKey]?.kind ?? 'cell'
        const part = kind === 'columnheader' ? 'columnheader' : kind === 'rowheader' ? 'rowheader' : 'cell'
        return {
          key: cellKey,
          label: runtime.data.items[cellKey]?.label ?? cellKey,
          kind: part,
          tag: part === 'columnheader' || part === 'rowheader' ? 'th' : 'td',
          cellProps: reactProps(runtime.getPartProps(part, cellKey)),
        }
      }),
    }
  })
}
