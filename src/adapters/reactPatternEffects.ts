import { useLayoutEffect, useRef } from 'react'
import type { ElementTarget, Key, PatternData, PatternDefinition, PatternEvent, PatternOptions } from '../schema'
import { reducePatternData } from '../kernel/patternReducer'
import { createParentByKey, evaluatePredicate, resolveKeyToken } from '../kernel/patternKernel'
import { createPatternRuntime, type CreatePatternRuntimeInput, type PatternRuntime } from '../kernel/patternRuntime'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

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
  const onEvent = useRovingFocusEventHandler({
    definition: input.definition,
    data: input.data,
    options: input.options ?? {},
    keyToElementId,
    onEvent: input.onEvent,
  })
  const runtime = createPatternRuntime({ ...input, onEvent, keyToElementId })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return runtime
}

export function useRovingFocusEventHandler({
  definition,
  data,
  options,
  keyToElementId,
  onEvent,
}: {
  definition: PatternDefinition
  data: PatternData
  options: PatternOptions
  keyToElementId: (key: Key) => string
  onEvent: (event: PatternEvent) => void
}) {
  const pendingFocusKeyRef = useRef<Key | null>(null)

  useLayoutEffect(() => {
    if (!usesRovingFocus(definition, options)) return
    const pendingFocusKey = pendingFocusKeyRef.current
    if (!pendingFocusKey || pendingFocusKey !== data.state?.activeKey) return
    pendingFocusKeyRef.current = null
    document.getElementById(keyToElementId(pendingFocusKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, definition, keyToElementId, options])

  return (event: PatternEvent) => {
    if (shouldFocusAfterControlledUpdate(event, definition, options)) {
      pendingFocusKeyRef.current = resolveEventActiveKey(definition, data, event)
    }
    onEvent(event)
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

function shouldFocusAfterControlledUpdate(event: PatternEvent, definition: PatternDefinition, options: PatternOptions) {
  if (!usesRovingFocus(definition, options)) return false
  const reason = event.meta?.reason
  return (event.type === 'navigate' || event.type === 'focus') && (reason === 'keyboard' || reason === 'typeahead')
}

function usesRovingFocus(definition: PatternDefinition, options: PatternOptions) {
  return definition.focusModel === 'rovingTabIndex' && options.focusStrategy !== 'ariaActiveDescendant'
}

function resolveEventActiveKey(definition: PatternDefinition, data: PatternData, event: PatternEvent): Key | null {
  if (event.type === 'focus') return event.key
  return reducePatternData(definition, data, event).state?.activeKey ?? null
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

export function handlePatternTrapFocus({
  event,
  definition,
  data,
  keyToElementId,
}: {
  event: { key: string; shiftKey?: boolean; preventDefault?: () => void }
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
}) {
  if (event.key !== 'Tab') return
  const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
  const trap = (definition.effects ?? []).find((effect) => effect.kind === 'trapFocus' && evaluatePredicate(effect.when, ctx))
  if (!trap || trap.kind !== 'trapFocus') return
  const root = resolveElementTarget(trap.root, data, keyToElementId)
  const items = root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
  if (items.length === 0) {
    event.preventDefault?.()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && active === first) {
    event.preventDefault?.()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault?.()
    first.focus()
  }
}

function resolveElementTarget(target: ElementTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  if (target.kind === 'firstFocusable') {
    return resolveElementTarget(target.root, data, keyToElementId)?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? null
  }
  const key = resolveElementTargetKey(target, data)
  return key ? document.getElementById(keyToElementId(key)) : null
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

function resolveElementTargetKey(target: Exclude<ElementTarget, { kind: 'firstFocusable' }>, data: PatternData): Key | null {
  const activeKey = data.state?.activeKey ?? null
  if (target.kind === 'key') return resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  const ownerKey = resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  return data.relations?.controlsByKey?.[ownerKey]?.[0] ?? null
}
