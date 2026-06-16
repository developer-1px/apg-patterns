import type { Key } from '../schema'

interface CellRelation {
  readonly rowKey: Key
  readonly columnKey: Key
  readonly cellKey: Key
}

export function createCellRows(
  rowKeys: readonly Key[],
  columnKeys: readonly Key[],
  cells: readonly CellRelation[],
): readonly (readonly Key[])[] {
  const cellKeyByRowAndColumn = new Map<Key, Map<Key, Key>>()
  for (const cell of cells) {
    let cellKeyByColumn = cellKeyByRowAndColumn.get(cell.rowKey)
    if (!cellKeyByColumn) {
      cellKeyByColumn = new Map<Key, Key>()
      cellKeyByRowAndColumn.set(cell.rowKey, cellKeyByColumn)
    }
    if (!cellKeyByColumn.has(cell.columnKey)) {
      cellKeyByColumn.set(cell.columnKey, cell.cellKey)
    }
  }

  return rowKeys.map((rowKey) => {
    const cellKeyByColumn = cellKeyByRowAndColumn.get(rowKey)
    if (!cellKeyByColumn) return []
    const row: Key[] = []
    for (const columnKey of columnKeys) {
      const cellKey = cellKeyByColumn.get(columnKey)
      if (cellKey) row.push(cellKey)
    }
    return row
  })
}
