import type { Key, PatternData, PatternEvent, PatternDefinition } from './schema'
import { resolveVisibleOrder, resolveNavigationTarget, createParentByKey } from './patternKernel'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'focus') return withActiveKey(data, event.key)

  if (event.type === 'navigate') {
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

  if (event.type === 'select') {
    return {
      ...data,
      state: {
        ...data.state,
        activeKey: event.extentKey ?? event.anchorKey ?? event.keys[0] ?? data.state?.activeKey,
        selectedKeys: [...event.keys],
        anchorKey: event.anchorKey,
        extentKey: event.extentKey,
      },
    }
  }

  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, activeKey: event.key, expandedKeys: [...expanded] } }
  }

  if (event.type === 'check') {
    return { ...data, state: { ...data.state, checkedByKey: { ...data.state?.checkedByKey, [event.key]: event.checked } } }
  }

  if (event.type === 'press') {
    return { ...data, state: { ...data.state, pressedByKey: { ...data.state?.pressedByKey, [event.key]: event.pressed ?? true } } }
  }

  if (event.type === 'value') {
    return { ...data, state: { ...data.state, valueByKey: { ...data.state?.valueByKey, [event.key]: event.value } } }
  }

  // 'open' 은 'expand' 의 별칭 — 둘 다 expandedKeys 갱신.
  if (event.type === 'open') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.open) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
  }

  // 'activate'/'typeahead'/'dismiss'/'extension' 는 outbound-only signal — state 미갱신 (의도).
  return data
}

function withActiveKey(data: PatternData, activeKey: Key): PatternData {
  return { ...data, state: { ...data.state, activeKey } }
}
