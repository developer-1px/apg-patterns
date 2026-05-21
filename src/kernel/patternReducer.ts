import type { PatternData, PatternEvent, PatternDefinition } from '../schema'
import { reduceDeclarativeTransitions } from './patternTransitions'
import { reduceFocusEvent, reduceNavigateEvent } from './navigationEvents'
import { reduceExtendSelectionEvent, reduceSelectAllEvent, reduceSelectColumnEvent, reduceSelectRowEvent } from './selectionEvents'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  const declarative = reduceDeclarativeTransitions(definition, data, event)
  if (declarative) return withLastEventReason(declarative, event)

  if (event.type === 'focus') return withLastEventReason(reduceFocusEvent(data, event), event)

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
    return withLastEventReason(reduceCheckEvent(data, event), event)
  }

  if (event.type === 'press') {
    return withLastEventReason(reducePressEvent(data, event), event)
  }

  if (event.type === 'value') {
    return withLastEventReason(reduceValueEvent(data, event), event)
  }

  // 'activate'/'typeahead'/'dismiss'/'extension' are outbound-only signals.
  return withLastEventReason(data, event)
}

function withLastEventReason(data: PatternData, event: PatternEvent): PatternData {
  if (!event.meta?.reason) return data
  return { ...data, state: { ...data.state, lastEventReason: event.meta.reason } }
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

function reduceCheckEvent(data: PatternData, event: Extract<PatternEvent, { type: 'check' }>): PatternData {
  return { ...data, state: { ...data.state, checkedByKey: { ...data.state?.checkedByKey, [event.key]: event.checked } } }
}

function reducePressEvent(data: PatternData, event: Extract<PatternEvent, { type: 'press' }>): PatternData {
  return { ...data, state: { ...data.state, pressedByKey: { ...data.state?.pressedByKey, [event.key]: event.pressed ?? true } } }
}

function reduceValueEvent(data: PatternData, event: Extract<PatternEvent, { type: 'value' }>): PatternData {
  return { ...data, state: { ...data.state, valueByKey: { ...data.state?.valueByKey, [event.key]: event.value } } }
}
