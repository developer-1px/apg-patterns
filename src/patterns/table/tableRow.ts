import { createPatternRuntime } from '../../kernel/patternRuntime'
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

export function createTableRows(runtime: ReturnType<typeof createPatternRuntime>): readonly ReactTableRow[] {
  const rowKeys = runtime.data.relations?.rowKeys ?? []
  const cells = runtime.data.relations?.cells ?? []
  return rowKeys.map((rowKey) => {
    const cellKeys = cells.filter((cell) => cell.rowKey === rowKey).map((cell) => cell.cellKey)
    return {
      key: rowKey,
      rowProps: reactProps(runtime.getPartProps('row', rowKey)),
      cells: cellKeys.map((cellKey) => createTableCell(runtime, cellKey)),
    }
  })
}

function createTableCell(runtime: ReturnType<typeof createPatternRuntime>, cellKey: Key): ReactTableCell {
  const kind = runtime.data.items[cellKey]?.kind ?? 'cell'
  const part = kind === 'columnheader' ? 'columnheader' : kind === 'rowheader' ? 'rowheader' : 'cell'
  return {
    key: cellKey,
    label: runtime.data.items[cellKey]?.label ?? cellKey,
    kind: part,
    tag: part === 'columnheader' || part === 'rowheader' ? 'th' : 'td',
    cellProps: reactProps(runtime.getPartProps(part, cellKey)),
  }
}
