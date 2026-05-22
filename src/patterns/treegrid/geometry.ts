import { visibleApgTreeItems } from '../../internal/collectionNavigation'
import type { Key, PatternData } from '../../schema'

export const visibleRowKeys = (data: PatternData): readonly Key[] => {
  const rootKeys = data.relations?.rootKeys ?? data.relations?.rowKeys ?? []
  const expanded = new Set(data.state?.expandedKeys ?? [])
  return visibleApgTreeItems({
    roots: rootKeys,
    children: (key) => data.relations?.childrenByKey?.[key] ?? [],
    isExpanded: (key) => expanded.has(key),
  })
}

export const visibleCells = (data: PatternData, rowKeys = visibleRowKeys(data)): readonly (readonly Key[])[] => {
  const cols = data.relations?.columnKeys ?? []
  const cellKeyByRowAndColumn = createCellKeyByRowAndColumn(data.relations?.cells ?? [])
  return rowKeys.map((rowKey) => {
    const cellKeyByColumn = cellKeyByRowAndColumn.get(rowKey)
    if (!cellKeyByColumn) return []
    return cols
      .map((columnKey) => cellKeyByColumn.get(columnKey))
      .filter((key): key is Key => Boolean(key))
  })
}

export const cellRowKey = (data: PatternData, cellKey: Key | null | undefined): Key | null => {
  if (!cellKey) return null
  return data.relations?.cells?.find((c) => c.cellKey === cellKey)?.rowKey ?? null
}

function createCellKeyByRowAndColumn(
  cells: readonly { rowKey: Key; columnKey: Key; cellKey: Key }[],
): ReadonlyMap<Key, ReadonlyMap<Key, Key>> {
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
  return cellKeyByRowAndColumn
}
