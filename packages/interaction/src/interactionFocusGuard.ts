import { classifyInteractionKeyTarget } from './interactionKeyTarget'
import type {
  InteractionKeyTargetKind,
  InteractionOwnerId,
  InteractionOwnerKind,
  InteractionOwnershipRegistry,
  InteractionRestoreTarget,
} from './interactionOwnership'

type InteractionFocusGuardRegistry = Pick<
  InteractionOwnershipRegistry,
  'getActiveOwner' | 'getOwner' | 'snapshot'
>

export type InteractionFocusGuardAction =
  | 'none'
  | 'restore-active-owner'
  | 'activate-target-owner'
  | 'allow-native-focus'

export type InteractionFocusGuardReason =
  | 'no-active-owner'
  | 'active-owner-target'
  | 'declared-owner-target'
  | 'temporary-owner-active'
  | 'active-owner-not-pattern'
  | 'native-target-allowed'
  | 'pattern-target-allowed'
  | 'unknown-target-allowed'
  | 'focus-guard-intervention'

export interface InteractionFocusGuardInput {
  targetKind?: InteractionKeyTargetKind
  targetOwnerId?: InteractionOwnerId | null
}

export interface InteractionFocusGuardResult {
  action: InteractionFocusGuardAction
  reason: InteractionFocusGuardReason
  activeOwnerId: InteractionOwnerId | null
  activeOwnerKind: InteractionOwnerKind | null
  targetKind: InteractionKeyTargetKind
  targetOwnerId?: InteractionOwnerId | null
  targetOwnerKind?: InteractionOwnerKind | null
  restoreTarget?: InteractionRestoreTarget | null
}

const guardedTargetKinds = new Set<InteractionKeyTargetKind>([
  'scroll-container',
  'incidental',
])

const nativeFocusTargetKinds = new Set<InteractionKeyTargetKind>([
  'temporary-control',
  'text-input',
  'textarea',
  'select',
  'contenteditable',
  'native-control',
])

export function evaluateInteractionFocusGuard(
  registry: InteractionFocusGuardRegistry,
  input: InteractionFocusGuardInput,
): InteractionFocusGuardResult {
  const activeOwner = registry.getActiveOwner()
  const activeOwnerId = activeOwner?.id ?? null
  const activeOwnerKind = activeOwner?.kind ?? null
  const targetKind = input.targetKind ?? 'unknown'
  const targetOwner = input.targetOwnerId ? registry.getOwner(input.targetOwnerId) : null
  const targetOwnerId = input.targetOwnerId ?? null
  const targetOwnerKind = targetOwner?.kind ?? null

  if (!activeOwner) {
    return focusGuardResult({
      action: 'none',
      reason: 'no-active-owner',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  if (targetOwnerId === activeOwner.id) {
    return focusGuardResult({
      action: 'none',
      reason: 'active-owner-target',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind: activeOwner.kind,
    })
  }

  if (targetOwner) {
    return focusGuardResult({
      action: 'activate-target-owner',
      reason: 'declared-owner-target',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  if (activeOwner.kind === 'temporary-control') {
    return focusGuardResult({
      action: 'allow-native-focus',
      reason: 'temporary-owner-active',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  if (activeOwner.kind !== 'pattern') {
    return focusGuardResult({
      action: 'none',
      reason: 'active-owner-not-pattern',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  if (guardedTargetKinds.has(targetKind)) {
    return focusGuardResult({
      action: 'restore-active-owner',
      reason: 'focus-guard-intervention',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
      restoreTarget: registry.snapshot().restoreTarget,
    })
  }

  if (nativeFocusTargetKinds.has(targetKind)) {
    return focusGuardResult({
      action: 'allow-native-focus',
      reason: 'native-target-allowed',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  if (targetKind === 'pattern') {
    return focusGuardResult({
      action: 'none',
      reason: 'pattern-target-allowed',
      activeOwnerId,
      activeOwnerKind,
      targetKind,
      targetOwnerId,
      targetOwnerKind,
    })
  }

  return focusGuardResult({
    action: 'none',
    reason: 'unknown-target-allowed',
    activeOwnerId,
    activeOwnerKind,
    targetKind,
    targetOwnerId,
    targetOwnerKind,
  })
}

export function evaluateInteractionFocusTarget(
  registry: InteractionFocusGuardRegistry,
  target: EventTarget | null,
  options?: Omit<InteractionFocusGuardInput, 'targetKind'>,
): InteractionFocusGuardResult {
  return evaluateInteractionFocusGuard(registry, {
    ...options,
    targetKind: classifyInteractionKeyTarget(target),
  })
}

function focusGuardResult(result: InteractionFocusGuardResult): InteractionFocusGuardResult {
  return result
}
