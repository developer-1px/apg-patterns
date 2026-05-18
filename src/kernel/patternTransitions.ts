import type { Key, PatternData, PatternDefinition, PatternEvent, StateAction } from '../schema'
import { createParentByKey, evaluatePredicate } from './patternKernel'
import { resolveTransitionValue } from './transitionValue'

export function reduceDeclarativeTransitions(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData | null {
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

function isKey(value: unknown): value is Key {
  return typeof value === 'string' && value.length > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
