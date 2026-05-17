import type { Key, PatternData, PatternEvent, PatternDefinition, StateAction, TransitionValue } from '../schema'
import { resolveVisibleOrder, resolveNavigationTarget, createParentByKey, evaluatePredicate } from './patternKernel'

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

function reduceDeclarativeTransitions(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData | null {
  const transitions = definition.transitions?.filter((transition) => {
    if (transition.on !== event.type) return false
    if ('name' in event && transition.name && event.name !== transition.name) return false
    if (transition.name && !('name' in event)) return false
    if (!transition.when) return true
    return evaluatePredicate(transition.when, {
      data,
      activeKey: data.state?.activeKey ?? null,
      parentByKey: createParentByKey(data),
    })
  }) ?? []
  if (transitions.length === 0) return null

  return transitions.reduce((nextData, transition) => {
    return transition.actions.reduce((current, action) => applyStateAction(current, event, action), nextData)
  }, data)
}

function applyStateAction(data: PatternData, event: PatternEvent, action: StateAction): PatternData {
  const state = { ...data.state }
  const current = state[action.field as keyof typeof state] as unknown

  if (action.kind === 'set') {
    return { ...data, state: { ...state, [action.field]: resolveTransitionValue(action.value, event, data) } }
  }

  if (action.kind === 'replaceSet') {
    const values = action.values.map((value) => resolveTransitionValue(value, event, data)).filter(isKey)
    return { ...data, state: { ...state, [action.field]: values } }
  }

  if (action.kind === 'setRecordValue') {
    const key = resolveTransitionValue(action.key, event, data)
    if (!isKey(key)) return data
    const record = isRecord(current) ? current : {}
    return { ...data, state: { ...state, [action.field]: { ...record, [key]: resolveTransitionValue(action.value, event, data) } } }
  }

  const value = resolveTransitionValue(action.value, event, data)
  if (!isKey(value)) return data
  const set = new Set(Array.isArray(current) ? current.filter(isKey) : [])

  if (action.kind === 'add') set.add(value)
  if (action.kind === 'remove') set.delete(value)
  if (action.kind === 'setMembership') {
    if (Boolean(resolveTransitionValue(action.present, event, data))) set.add(value)
    else set.delete(value)
  }
  if (action.kind === 'toggleInSet') {
    if (set.has(value)) set.delete(value)
    else set.add(value)
  }

  return { ...data, state: { ...state, [action.field]: [...set] } }
}

function resolveTransitionValue(value: TransitionValue, event: PatternEvent, data: PatternData): unknown {
  if ('literal' in value) return value.literal
  if (value.from === '$activeKey') return data.state?.activeKey ?? null
  if (value.from === '$event.key') return 'key' in event ? event.key : null
  if (value.from === '$event.keys') return 'keys' in event ? event.keys : []
  if (value.from === '$event.anchorKey') return 'anchorKey' in event ? event.anchorKey : null
  if (value.from === '$event.extentKey') return 'extentKey' in event ? event.extentKey : null
  if (value.from === '$event.expanded') return 'expanded' in event ? event.expanded : null
  if (value.from === '$event.checked') return 'checked' in event ? event.checked : null
  if (value.from === '$event.pressed') return 'pressed' in event ? event.pressed : null
  if (value.from === '$event.value') return 'value' in event ? event.value : null
  if (value.from === '$event.payload.value') return 'payload' in event ? event.payload?.value ?? null : null
  return null
}

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
