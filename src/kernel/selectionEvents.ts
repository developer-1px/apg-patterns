import type { Key, PatternData, PatternDefinition, PatternEvent } from '../schema'
import { findCellPosition, rectangleKeys, stepCell, visibleCellRows } from './cellSelection'

export function reduceSelectAllEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const keys = rows.flat()
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

export function reduceSelectColumnEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  const position = findCellPosition(rows, activeKey)
  if (!position) return data
  const keys = rows.map((row) => row[position.column]).filter(isKey)
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

export function reduceSelectRowEvent(definition: PatternDefinition, data: PatternData): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  const position = findCellPosition(rows, activeKey)
  if (!position) return data
  const keys = [...(rows[position.row] ?? [])]
  return keys.length > 0 ? withSelection(data, keys, keys[0]!, keys[keys.length - 1]!) : data
}

export function reduceExtendSelectionEvent(definition: PatternDefinition, data: PatternData, event: Extract<PatternEvent, { type: 'extendSelection' }>): PatternData {
  const rows = visibleCellRows(definition, data)
  const activeKey = data.state?.activeKey
  if (!activeKey) return data
  const anchorKey = data.state?.anchorKey ?? activeKey
  const extentKey = stepCell(rows, activeKey, event.direction)
  const keys = rectangleKeys(rows, anchorKey, extentKey)
  return withSelection(data, keys, anchorKey, extentKey)
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

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
}
