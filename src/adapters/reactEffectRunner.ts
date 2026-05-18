import type { Key, PatternData, PatternDefinition } from '../schema'
import { createParentByKey, evaluatePredicate } from '../kernel/patternKernel'
import { resolveElementTarget } from './reactElementTargets'

type EffectDefinition = NonNullable<PatternDefinition['effects']>[number]
type FocusEffect = Extract<EffectDefinition, { kind: 'focus' }>
type RestoreFocusEffect = Extract<EffectDefinition, { kind: 'restoreFocus' }>
type FocusEffectTarget = FocusEffect['target']

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
  for (const [index, effect] of (definition.effects ?? []).entries()) {
    const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
    const matches = evaluatePredicate(effect.when ?? { kind: 'always' }, ctx)
    nextMatches[index] = matches
    if (!shouldRunEffect({ effect, matches, previousMatches: previousMatches[index], data, definition, keyToElementId })) continue
    if (effect.kind === 'focus') runFocusEffect(effect, data, keyToElementId)
    if (effect.kind === 'restoreFocus') runRestoreFocusEffect(effect, data, keyToElementId)
  }
  return nextMatches
}

function runFocusEffect(effect: FocusEffect, data: PatternData, keyToElementId: (key: Key) => string) {
  const target = resolveFocusEffectTarget(effect.target, data, keyToElementId)
  target?.focus({ preventScroll: effect.preventScroll ?? Boolean(effect.on) })
}

function runRestoreFocusEffect(effect: RestoreFocusEffect, data: PatternData, keyToElementId: (key: Key) => string) {
  const target = resolveElementTarget(effect.target, data, keyToElementId)
  target?.focus({ preventScroll: effect.preventScroll })
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

function resolveFocusEffectTarget(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  const activeKey = data.state?.activeKey
  if (target.kind === 'activeKeyElement') return activeKey ? document.getElementById(keyToElementId(activeKey)) : null
  return resolveElementTarget(target, data, keyToElementId)
}

function containsActiveElement(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string, rootRole: string): boolean {
  const targetElement = resolveFocusEffectTarget(target, data, keyToElementId)
  const root = targetElement ? closestRole(targetElement, rootRole) : null
  return Boolean(root && document.activeElement && root.contains(document.activeElement))
}

function closestRole(element: HTMLElement, role: string): HTMLElement | null {
  let current: HTMLElement | null = element
  while (current) {
    if (current.getAttribute('role') === role) return current
    current = current.parentElement
  }
  return null
}
