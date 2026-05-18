import type { Key, PatternData, PatternDefinition } from '../schema'
import { resolveVisibleOrder } from './patternKernel'

export type CellRows = readonly (readonly Key[])[]

export function visibleCellRows(definition: PatternDefinition, data: PatternData): CellRows {
  const visibleKeys = new Set(resolveVisibleOrder(definition.navigation.visibleOrder, data))
  const cellByKey = new Map((data.relations?.cells ?? []).map((cell) => [cell.cellKey, cell]))
  const rows: Key[][] = []
  const rowIndexByKey = new Map<Key, number>()
  for (const key of visibleKeys) {
    const cell = cellByKey.get(key)
    if (!cell) continue
    let rowIndex = rowIndexByKey.get(cell.rowKey)
    if (rowIndex === undefined) {
      rowIndex = rows.length
      rowIndexByKey.set(cell.rowKey, rowIndex)
      rows.push([])
    }
    rows[rowIndex]!.push(cell.cellKey)
  }
  return rows
}

export function findCellPosition(rows: CellRows, key: Key | null | undefined): { row: number; column: number } | null {
  if (!key) return null
  for (let row = 0; row < rows.length; row += 1) {
    const column = rows[row]!.indexOf(key)
    if (column !== -1) return { row, column }
  }
  return null
}

export function stepCell(rows: CellRows, key: Key, direction: string): Key {
  const position = findCellPosition(rows, key)
  if (!position) return key
  const { row, column } = position
  if (direction === 'right') return rows[row]?.[column + 1] ?? key
  if (direction === 'left') return rows[row]?.[column - 1] ?? key
  if (direction === 'down') return rows[row + 1]?.[column] ?? key
  if (direction === 'up') return rows[row - 1]?.[column] ?? key
  if (direction === 'rowStart') return rows[row]?.[0] ?? key
  if (direction === 'rowEnd') return rows[row]?.[rows[row]!.length - 1] ?? key
  return key
}

export function rectangleKeys(rows: CellRows, anchorKey: Key, extentKey: Key): Key[] {
  const anchor = findCellPosition(rows, anchorKey)
  const extent = findCellPosition(rows, extentKey)
  if (!anchor || !extent) return [extentKey]
  const rowMin = Math.min(anchor.row, extent.row)
  const rowMax = Math.max(anchor.row, extent.row)
  const columnMin = Math.min(anchor.column, extent.column)
  const columnMax = Math.max(anchor.column, extent.column)
  const keys: Key[] = []
  for (let row = rowMin; row <= rowMax; row += 1) {
    for (let column = columnMin; column <= columnMax; column += 1) {
      const key = rows[row]?.[column]
      if (key) keys.push(key)
    }
  }
  return keys
}
