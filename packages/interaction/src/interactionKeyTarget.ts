import type { InteractionKeyTargetKind } from './interactionOwnership'

const interactionKeyTargetKinds = new Set<InteractionKeyTargetKind>([
  'unknown',
  'pattern',
  'temporary-control',
  'text-input',
  'textarea',
  'select',
  'contenteditable',
  'native-control',
  'scroll-container',
  'incidental',
])

const textInputTypes = new Set([
  '',
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
])

const patternRoles = new Set([
  'grid',
  'listbox',
  'menu',
  'menubar',
  'radiogroup',
  'tablist',
  'toolbar',
  'tree',
  'treegrid',
])

const scrollableOverflowPattern = /^(auto|scroll|overlay)$/

export function classifyInteractionKeyTarget(target: EventTarget | null): InteractionKeyTargetKind {
  if (!(target instanceof Element)) return 'unknown'

  const explicitKind = target.getAttribute('data-interaction-target-kind')
  if (isInteractionKeyTargetKind(explicitKind)) return explicitKind

  if (isContentEditableTarget(target)) return 'contenteditable'
  if (target instanceof HTMLTextAreaElement) return 'textarea'
  if (target instanceof HTMLSelectElement) return 'select'

  if (target instanceof HTMLInputElement) {
    return textInputTypes.has(target.type) ? 'text-input' : 'native-control'
  }

  const role = target.getAttribute('role')
  if (role && patternRoles.has(role)) return 'pattern'

  if (isNativeControlTarget(target)) return 'native-control'
  if (isScrollContainerTarget(target)) return 'scroll-container'
  if (target instanceof HTMLElement && target.tabIndex >= 0) return 'incidental'

  return 'unknown'
}

function isInteractionKeyTargetKind(value: string | null): value is InteractionKeyTargetKind {
  return value !== null && interactionKeyTargetKinds.has(value as InteractionKeyTargetKind)
}

function isContentEditableTarget(target: Element): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const contentEditable = target.getAttribute('contenteditable')
  if (contentEditable === 'true' || contentEditable === 'plaintext-only') return true
  return target.closest('[contenteditable="true"], [contenteditable="plaintext-only"]') !== null
}

function isNativeControlTarget(target: Element): boolean {
  const tagName = target.tagName.toLowerCase()
  if (tagName === 'button' || tagName === 'summary') return true
  return target instanceof HTMLAnchorElement && target.hasAttribute('href')
}

function isScrollContainerTarget(target: Element): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.hasAttribute('data-interaction-scroll-container')) return true

  const overflow = target.style.overflow
  const overflowX = target.style.overflowX
  const overflowY = target.style.overflowY

  return scrollableOverflowPattern.test(overflow)
    || scrollableOverflowPattern.test(overflowX)
    || scrollableOverflowPattern.test(overflowY)
}
