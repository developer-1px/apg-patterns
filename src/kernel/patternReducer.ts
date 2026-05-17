import type { Key, PatternData, PatternEvent, PatternDefinition, StateAction, TransitionValue } from '../schema'
import { resolveVisibleOrder, resolveNavigationTarget, createParentByKey, evaluatePredicate } from './patternKernel'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  const declarative = reduceDeclarativeTransitions(definition, data, event)
  if (declarative) return declarative

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
  if (value.from === '$event.open') return 'open' in event ? event.open : null
  if (value.from === '$event.checked') return 'checked' in event ? event.checked : null
  if (value.from === '$event.pressed') return 'pressed' in event ? event.pressed : null
  if (value.from === '$event.value') return 'value' in event ? event.value : null
  if (value.from === '$event.payload.value') return 'payload' in event ? event.payload?.value ?? null : null
  return null
}

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
