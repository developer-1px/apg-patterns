import { useLayoutEffect, useRef } from 'react'
import type { Key, PatternData, PatternDefinition } from '../schema'
import { createParentByKey, evaluatePredicate } from '../kernel/patternKernel'
import { createPatternRuntime, type CreatePatternRuntimeInput, type PatternRuntime } from '../kernel/patternRuntime'
import { resolveElementTarget } from './reactElementTargets'
import { useRovingFocusEventHandler } from './reactRovingFocus'
export { handlePatternTrapFocus } from './reactPatternTrapFocus'
export { useRovingFocusEventHandler } from './reactRovingFocus'

export function usePatternEffects({
  definition,
  data,
  keyToElementId,
}: {
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
}) {
  const previousMatches = useRef<boolean[]>([])

  useLayoutEffect(() => {
    const nextMatches: boolean[] = []
    for (const [index, effect] of (definition.effects ?? []).entries()) {
      const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
      const matches = evaluatePredicate(effect.when ?? { kind: 'always' }, ctx)
      nextMatches[index] = matches
      if (!shouldRunEffect({ effect, matches, previousMatches: previousMatches.current[index], data, definition, keyToElementId })) continue
      if (effect.kind === 'focus') runFocusEffect(effect, data, keyToElementId)
      if (effect.kind === 'restoreFocus') runRestoreFocusEffect(effect, data, keyToElementId)
    }
    previousMatches.current = nextMatches
  }, [data, definition, keyToElementId])
}

export function useReactPatternRuntime(input: CreatePatternRuntimeInput): PatternRuntime {
  const keyToElementId = input.keyToElementId ?? ((key: Key) => `${key}`)
  const keyboardFocusKeyRef = useRef<Key | null>(null)
  const onEvent = useRovingFocusEventHandler({
    definition: input.definition,
    data: input.data,
    options: input.options ?? {},
    keyToElementId,
    keyboardFocusKeyRef,
    onEvent: input.onEvent,
  })
  const runtime = createPatternRuntime({ ...input, onEvent, keyToElementId })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return withKeyboardFocusVisibleProps(runtime, keyboardFocusKeyRef.current)
}

function withKeyboardFocusVisibleProps(runtime: PatternRuntime, keyboardFocusKey: Key | null): PatternRuntime {
  if (!keyboardFocusKey) return runtime
  const addFocusVisible = (props: Record<string, unknown>, key?: Key) => {
    if (key !== keyboardFocusKey) return props
    return { ...props, 'data-focus-visible': '' }
  }
  return {
    ...runtime,
    getItemProps: (partName, key) => addFocusVisible(runtime.getItemProps(partName, key), key),
    getPartProps: (partName, key) => addFocusVisible(runtime.getPartProps(partName, key), key),
  }
}

type EffectDefinition = NonNullable<PatternDefinition['effects']>[number]
type FocusEffect = Extract<EffectDefinition, { kind: 'focus' }>
type RestoreFocusEffect = Extract<EffectDefinition, { kind: 'restoreFocus' }>
type FocusEffectTarget = FocusEffect['target']

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
