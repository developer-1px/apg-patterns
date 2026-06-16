import type { Key, PatternData, PatternDefinition, PatternEvent } from '../schema'
import { createParentByKey, resolveNavigationTarget, resolveVisibleOrder } from './patternKernel'
import { registerKernelBuiltins } from './kernelBuiltins'
import { reduceDeclarativeTransitions } from './patternTransitions'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  registerKernelBuiltins()
  const declarative = reduceDeclarativeTransitions(definition, data, event)
  if (declarative) return withLastEventReason(declarative, event)

  if (event.type === 'focus') return withLastEventReason(withActiveKey(data, event.key), event)

  if (event.type === 'navigate') {
    return withLastEventReason(reduceNavigateEvent(definition, data, event), event)
  }

  if (event.type === 'select') {
    return withLastEventReason({
      ...data,
      state: {
        ...data.state,
        activeKey: event.extentKey ?? event.anchorKey ?? event.keys[0] ?? data.state?.activeKey,
        selectedKeys: [...event.keys],
        anchorKey: event.anchorKey,
        extentKey: event.extentKey,
      },
    }, event)
  }

  if (event.type === 'selectAll') {
    return withLastEventReason(reduceSelectAllEvent(definition, data), event)
  }

  if (event.type === 'selectColumn') {
    return withLastEventReason(reduceSelectColumnEvent(definition, data), event)
  }

  if (event.type === 'selectRow') {
    return withLastEventReason(reduceSelectRowEvent(definition, data), event)
  }

  if (event.type === 'extendSelection') {
    return withLastEventReason(reduceExtendSelectionEvent(definition, data, event), event)
  }

  if (event.type === 'expand') {
    return withLastEventReason(reduceExpandEvent(data, event), event)
  }

  if (event.type === 'expandActiveRow') {
    return withLastEventReason(reduceExpandActiveRowEvent(data, event), event)
  }

  if (event.type === 'check') {
    return withLastEventReason({ ...data, state: { ...data.state, checkedByKey: { ...data.state?.checkedByKey, [event.key]: event.checked } } }, event)
  }

  if (event.type === 'press') {
    return withLastEventReason({ ...data, state: { ...data.state, pressedByKey: { ...data.state?.pressedByKey, [event.key]: event.pressed ?? true } } }, event)
  }

  if (event.type === 'value') {
    return withLastEventReason({ ...data, state: { ...data.state, valueByKey: { ...data.state?.valueByKey, [event.key]: event.value } } }, event)
  }

  // 'activate'/'typeahead'/'dismiss'/'extension' are outbound-only signals.
  return withLastEventReason(data, event)
}

function withLastEventReason(data: PatternData, event: PatternEvent): PatternData {
  if (!event.meta?.reason) return data
  return { ...data, state: { ...data.state, lastEventReason: event.meta.reason } }
}

function reduceNavigateEvent(definition: PatternDefinition, data: PatternData, event: Extract<PatternEvent, { type: 'navigate' }>): PatternData {
  const visibleKeys = resolveVisibleOrder(definition.navigation.visibleOrder, data)
  const activeKey = data.state?.activeKey ?? visibleKeys[0]
  if (!activeKey) return data
  const target = definition.navigation.targets[event.direction]
  if (!target) {
    throw new Error(
      `[apg-pattern] navigate(direction="${event.direction}") emitted but definition.navigation.targets["${event.direction}"] is missing — register a target or fix the keyboard binding.`,
    )
  }
  const nextKey = resolveNavigationTarget(target, {
    activeKey,
    data,
    parentByKey: createParentByKey(data),
    visibleKeys,
  })
  return nextKey ? withActiveKey(data, nextKey) : data
}

function reduceSelectAllEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const keys = rows.flat()
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

function reduceSelectColumnEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  const position = findCellPosition(rows, activeKey)
  if (!position) return data
  const keys = rows.map((row) => row[position.column]).filter(isKey)
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

function reduceSelectRowEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  const position = findCellPosition(rows, activeKey)
  if (!position) return data
  const keys = [...(rows[position.row] ?? [])]
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

function reduceExtendSelectionEvent(definition: PatternDefinition, data: PatternData, event: Extract<PatternEvent, { type: 'extendSelection' }>): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  if (!activeKey) return data
  const anchorKey = data.state?.anchorKey ?? activeKey
  const extentKey = stepCell(rows, activeKey, event.direction)
  const keys = rectangleKeys(rows, anchorKey, extentKey)
  return withSelection(data, keys, anchorKey, extentKey)
}

function reduceExpandEvent(data: PatternData, event: Extract<PatternEvent, { type: 'expand' }>): PatternData {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  if (event.expanded) expanded.add(event.key)
  else expanded.delete(event.key)
  const nextActive = data.state?.activeKey ?? event.key
  return { ...data, state: { ...data.state, activeKey: nextActive, expandedKeys: [...expanded] } }
}

function reduceExpandActiveRowEvent(data: PatternData, event: Extract<PatternEvent, { type: 'expandActiveRow' }>): PatternData {
  const activeKey = data.state?.activeKey
  const rowKey = activeKey ? data.relations?.cells?.find((cell) => cell.cellKey === activeKey)?.rowKey : undefined
  if (!rowKey) return data

  const expanded = new Set(data.state?.expandedKeys ?? [])
  if (event.expanded) expanded.add(rowKey)
  else expanded.delete(rowKey)
  return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
}

function withActiveKey(data: PatternData, activeKey: Key): PatternData {
  return { ...data, state: { ...data.state, activeKey } }
}

function withSelection(data: PatternData, keys: readonly Key[], anchorKey: Key | null, extentKey: Key | null): PatternData {
  return {
    ...data,
    state: {
      ...data.state,
      activeKey: extentKey ?? anchorKey ?? keys[0] ?? data.state?.activeKey,
      selectedKeys: [...keys],
      anchorKey,
      extentKey,
    },
  }
}

type CellRows = readonly (readonly Key[])[]

function visibleCellRows(definition: PatternDefinition, data: PatternData): CellRows {
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

function findCellPosition(rows: CellRows, key: Key | null | undefined): { row: number; column: number } | null {
  if (!key) return null
  for (let row = 0; row < rows.length; row += 1) {
    const column = rows[row]!.indexOf(key)
    if (column !== -1) return { row, column }
  }
  return null
}

function stepCell(rows: CellRows, key: Key, direction: string): Key {
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

function rectangleKeys(rows: CellRows, anchorKey: Key, extentKey: Key): Key[] {
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

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
}
