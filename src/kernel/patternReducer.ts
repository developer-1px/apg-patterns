import type { Key, PatternData, PatternEvent, PatternDefinition } from '../schema'
import { findCellPosition, rectangleKeys, stepCell, visibleCellRows } from './cellSelection'
import { resolveVisibleOrder, resolveNavigationTarget, createParentByKey } from './patternKernel'
import { reduceDeclarativeTransitions } from './patternTransitions'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  const declarative = reduceDeclarativeTransitions(definition, data, event)
  if (declarative) return withLastEventReason(declarative, event)

  if (event.type === 'focus') return withLastEventReason(withActiveKey(data, event.key), event)

  if (event.type === 'navigate') {
    const visibleKeys = resolveVisibleOrder(definition.navigation.visibleOrder, data)
    const activeKey = data.state?.activeKey ?? visibleKeys[0]
    if (!activeKey) return withLastEventReason(data, event)
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
    return withLastEventReason(nextKey ? withActiveKey(data, nextKey) : data, event)
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
    const rows = visibleCellRows(definition, data)
    const keys = rows.flat()
    return keys.length > 0
      ? withLastEventReason(withSelection(data, keys, keys[0]!, keys[keys.length - 1]!), event)
      : withLastEventReason(data, event)
  }

  if (event.type === 'selectColumn') {
    const rows = visibleCellRows(definition, data)
    const activeKey = data.state?.activeKey
    const position = findCellPosition(rows, activeKey)
    if (!position) return withLastEventReason(data, event)
    const keys = rows.map((row) => row[position.column]).filter(isKey)
    return keys.length > 0
      ? withLastEventReason(withSelection(data, keys, keys[0]!, keys[keys.length - 1]!), event)
      : withLastEventReason(data, event)
  }

  if (event.type === 'selectRow') {
    const rows = visibleCellRows(definition, data)
    const activeKey = data.state?.activeKey
    const position = findCellPosition(rows, activeKey)
    if (!position) return withLastEventReason(data, event)
    const keys = [...(rows[position.row] ?? [])]
    return keys.length > 0
      ? withLastEventReason(withSelection(data, keys, keys[0]!, keys[keys.length - 1]!), event)
      : withLastEventReason(data, event)
  }

  if (event.type === 'extendSelection') {
    const rows = visibleCellRows(definition, data)
    const activeKey = data.state?.activeKey
    if (!activeKey) return withLastEventReason(data, event)
    const anchorKey = data.state?.anchorKey ?? activeKey
    const extentKey = stepCell(rows, activeKey, event.direction)
    const keys = rectangleKeys(rows, anchorKey, extentKey)
    return withLastEventReason(withSelection(data, keys, anchorKey, extentKey), event)
  }

  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    // Preserve a pre-existing activeKey (e.g. a treegrid cell key) — only adopt the row key when no active.
    const currentActive = data.state?.activeKey
    const nextActive = currentActive ?? event.key
    return withLastEventReason({ ...data, state: { ...data.state, activeKey: nextActive, expandedKeys: [...expanded] } }, event)
  }

  if (event.type === 'expandActiveRow') {
    const activeKey = data.state?.activeKey
    const rowKey = activeKey ? data.relations?.cells?.find((cell) => cell.cellKey === activeKey)?.rowKey : undefined
    if (!rowKey) return withLastEventReason(data, event)
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(rowKey)
    else expanded.delete(rowKey)
    return withLastEventReason({ ...data, state: { ...data.state, expandedKeys: [...expanded] } }, event)
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

  // 'activate'/'typeahead'/'dismiss'/'extension' 는 outbound-only signal — state 미갱신 (의도).
  return withLastEventReason(data, event)
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

function withLastEventReason(data: PatternData, event: PatternEvent): PatternData {
  if (!event.meta?.reason) return data
  return { ...data, state: { ...data.state, lastEventReason: event.meta.reason } }
}

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
}
