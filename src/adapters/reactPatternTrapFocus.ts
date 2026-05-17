import type { Key, PatternData, PatternDefinition } from '../schema'
import { createParentByKey, evaluatePredicate } from '../kernel/patternKernel'
import { FOCUSABLE_SELECTOR, resolveElementTarget } from './reactElementTargets'

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
