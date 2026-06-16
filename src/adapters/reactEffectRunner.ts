import type { EffectDefinition, Key, PatternData, PatternDefinition } from '../schema'
import { createParentByKey, evaluatePredicate } from '../kernel/patternKernel'
import { resolveElementTarget } from './reactElementTargets'
import { containsActiveElement, resolveFocusEffectTarget } from './reactFocusEffectTarget'

export function runPatternEffects({
  definition,
  data,
  keyToElementId,
  previousMatches,
}: {
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
  previousMatches: readonly (boolean | undefined)[]
}) {
  const nextMatches: boolean[] = []
  const parentByKey = createParentByKey(data)
  for (const [index, effect] of (definition.effects ?? []).entries()) {
    const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey, keyToElementId }
    const matches = evaluatePredicate(effect.when ?? { kind: 'always' }, ctx)
    nextMatches[index] = matches
    if (!shouldRunEffect({ effect, matches, previousMatches: previousMatches[index], data, definition, keyToElementId })) continue
    if (effect.kind === 'focus') {
      const target = resolveFocusEffectTarget(effect.target, data, keyToElementId)
      target?.focus({ preventScroll: effect.preventScroll ?? Boolean(effect.on) })
    }
    if (effect.kind === 'restoreFocus') {
      const target = resolveElementTarget(effect.target, data, keyToElementId)
      target?.focus({ preventScroll: effect.preventScroll })
    }
  }
  return nextMatches
}

function shouldRunEffect({
  effect,
  matches,
  previousMatches,
  data,
  definition,
  keyToElementId,
}: {
  effect: EffectDefinition
  matches: boolean
  previousMatches: boolean | undefined
  data: PatternData
  definition: PatternDefinition
  keyToElementId: (key: Key) => string
}): boolean {
  if (!matches) return false
  if (effect.kind === 'focus' && effect.on?.state === 'activeKey') {
    const activeKey = data.state?.activeKey
    const reason = data.state?.lastEventReason
    if (!activeKey || !reason || !effect.on.reasons.some((item) => item === reason)) return false
    return effect.scope?.kind !== 'focusWithin' || reason === 'keyboard' || reason === 'typeahead' || containsActiveElement(effect.target, data, keyToElementId, definition.rootRole)
  }
  return previousMatches !== undefined && previousMatches !== matches
}
