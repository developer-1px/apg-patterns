import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  createParentByKey,
  evaluatePredicate,
  resolveKeyToken,
  type ElementTarget,
  type Key,
  type PatternData,
  type PatternDefinition,
} from '../../src'

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

  useEffect(() => {
    const nextMatches: boolean[] = []
    for (const [index, effect] of (definition.effects ?? []).entries()) {
      const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
      const matches = evaluatePredicate(effect.when, ctx)
      nextMatches[index] = matches
      if (!matches || previousMatches.current[index] === matches) continue
      if (effect.kind === 'focus' || effect.kind === 'restoreFocus') {
        const target = resolveElementTarget(effect.target, data, keyToElementId)
        // eslint-disable-next-line no-console
        console.log('effect', effect.kind, target?.id)
        target?.focus({ preventScroll: effect.preventScroll })
      }
    }
    previousMatches.current = nextMatches
  }, [data, definition, keyToElementId])
}

export function handlePatternTrapFocus({
  event,
  definition,
  data,
  keyToElementId,
}: {
  event: ReactKeyboardEvent
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
    event.preventDefault()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
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

function resolveElementTargetKey(target: Exclude<ElementTarget, { kind: 'firstFocusable' }>, data: PatternData): Key | null {
  const activeKey = data.state?.activeKey ?? null
  if (target.kind === 'key') return resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  const ownerKey = resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  return data.relations?.controlsByKey?.[ownerKey]?.[0] ?? null
}
