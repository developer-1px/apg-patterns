import type { Key, PatternData, PatternEvent, PatternDefinition } from '../schema'
import { resolveVisibleOrder, resolveNavigationTarget, createParentByKey } from './patternKernel'
import { reduceDeclarativeTransitions } from './patternTransitions'
import { reduceExpandActiveRowEvent, reduceExpandEvent } from './expansionEvents'
import { reduceExtendSelectionEvent, reduceSelectAllEvent, reduceSelectColumnEvent, reduceSelectRowEvent, withSelection } from './selectionEvents'

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

  // 'activate'/'typeahead'/'dismiss'/'extension' 는 outbound-only signal — state 미갱신 (의도).
  return withLastEventReason(data, event)
}

function withActiveKey(data: PatternData, activeKey: Key): PatternData {
  return { ...data, state: { ...data.state, activeKey } }
}

function withLastEventReason(data: PatternData, event: PatternEvent): PatternData {
  if (!event.meta?.reason) return data
  return { ...data, state: { ...data.state, lastEventReason: event.meta.reason } }
}
