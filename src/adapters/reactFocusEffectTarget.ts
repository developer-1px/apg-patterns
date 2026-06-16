import type { Key, PatternData, PatternDefinition } from '../schema'
import { resolveElementTarget } from './reactElementTargets'

type EffectDefinition = NonNullable<PatternDefinition['effects']>[number]
type FocusEffectTarget = Extract<EffectDefinition, { kind: 'focus' }>['target']

export function resolveFocusEffectTarget(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  const activeKey = data.state?.activeKey
  if (target.kind === 'activeKeyElement') return activeKey ? document.getElementById(keyToElementId(activeKey)) : null
  return resolveElementTarget(target, data, keyToElementId)
}

export function containsActiveElement(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string, rootRole: string): boolean {
  const targetElement = resolveFocusEffectTarget(target, data, keyToElementId)
  if (!targetElement) return false
  let root: HTMLElement | null = targetElement
  while (root && root.getAttribute('role') !== rootRole) {
    root = root.parentElement
  }
  return Boolean(root && document.activeElement && root.contains(document.activeElement))
}
