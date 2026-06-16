import type { ElementTarget, Key, PatternData } from '../schema'
import { resolveKeyToken } from '../kernel/patternKernel'

type ReactFocusTarget = HTMLElement | null | { readonly current: HTMLElement | null } | (() => HTMLElement | null)

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function resolveReactFocusTarget(target: ReactFocusTarget | undefined): HTMLElement | null {
  if (!target) return null
  if (typeof target === 'function') return target()
  if (typeof target === 'object' && 'current' in target) return target.current
  return target
}

export function resolveElementTarget(target: ElementTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  if (target.kind === 'firstAvailable') {
    for (const candidate of target.targets) {
      const element = resolveOptionalElementTarget(candidate, data, keyToElementId)
      if (element) return element
    }
    return null
  }
  if (target.kind === 'firstFocusable') {
    return resolveElementTarget(target.root, data, keyToElementId)?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? null
  }
  const key = resolveElementTargetKey(target, data)
  return key ? document.getElementById(keyToElementId(key)) : null
}

function resolveOptionalElementTarget(target: Exclude<ElementTarget, { kind: 'firstAvailable' }>, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  try {
    return resolveElementTarget(target, data, keyToElementId)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Cannot resolve key token:')) return null
    throw error
  }
}

function resolveElementTargetKey(target: Extract<ElementTarget, { kind: 'key' }> | Extract<ElementTarget, { kind: 'controlledBy' }>, data: PatternData): Key | null {
  const activeKey = data.state?.activeKey ?? null
  if (target.kind === 'key') return resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  const ownerKey = resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  return data.relations?.controlsByKey?.[ownerKey]?.[0] ?? null
}
