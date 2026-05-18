import type { Key, PatternData, PatternDefinition, PatternEvent } from '../schema'
import { createParentByKey, resolveNavigationTarget, resolveVisibleOrder } from './patternKernel'

export function reduceFocusEvent(data: PatternData, event: Extract<PatternEvent, { type: 'focus' }>): PatternData {
  return withActiveKey(data, event.key)
}

export function reduceNavigateEvent(definition: PatternDefinition, data: PatternData, event: Extract<PatternEvent, { type: 'navigate' }>): PatternData {
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

function withActiveKey(data: PatternData, activeKey: Key): PatternData {
  return { ...data, state: { ...data.state, activeKey } }
}
