import type {
  InteractionKeyInput,
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerId,
  InteractionOwnerKind,
  InteractionOwnershipRegistry,
  InteractionMatchedKeyRule,
  InteractionRestoreTarget,
} from './interactionOwnership'
import { matchInteractionKeyRule, resolveInteractionRestoreTarget } from './interactionOwnership'

export type InteractionRouteStatus = 'owner' | 'restore' | 'native' | 'ignored'

export type InteractionRouteReason =
  | 'active-owner-handled'
  | 'temporary-owner-restore-requested'
  | 'shell-owner-handled'
  | 'native-target-protected'
  | 'active-owner-yielded'
  | 'no-owner'
  | 'browser-fallback'

export interface InteractionRouteResult {
  status: InteractionRouteStatus
  reason: InteractionRouteReason
  activeOwnerId: InteractionOwnerId | null
  candidateOwnerIds: readonly InteractionOwnerId[]
  targetKind: InteractionKeyTargetKind
  ownerId?: InteractionOwnerId
  ownerKind?: InteractionOwnerKind
  matchedKeyRule?: InteractionMatchedKeyRule | null
  restoreOwnerId?: InteractionOwnerId | null
  restoreTarget?: InteractionRestoreTarget | null
}

const nativeTextTargetKinds = new Set<InteractionKeyTargetKind>([
  'text-input',
  'textarea',
  'select',
  'contenteditable',
])

export function routeInteractionKey(
  registry: Pick<InteractionOwnershipRegistry, 'getActiveOwner' | 'getOwner' | 'snapshot'>,
  input: InteractionKeyInput,
): InteractionRouteResult {
  const snapshot = registry.snapshot()
  const activeOwner = registry.getActiveOwner()
  const activeOwnerId = activeOwner?.id ?? null
  const targetKind = input.targetKind ?? 'unknown'

  if (!activeOwner) {
    if (isNativeTextTarget(targetKind)) {
      const shellOwner = findShellOwner(registry, input, undefined, { requireNativeAllowance: true })
      if (shellOwner) {
        return ownerRoute('shell-owner-handled', shellOwner, input, activeOwnerId, [shellOwner.id], targetKind)
      }

      return {
        status: 'native',
        reason: 'native-target-protected',
        activeOwnerId,
        candidateOwnerIds: [],
        targetKind,
      }
    }

    const shellOwner = findShellOwner(registry, input)
    if (shellOwner) {
      return ownerRoute('shell-owner-handled', shellOwner, input, activeOwnerId, [shellOwner.id], targetKind)
    }

    return {
      status: 'ignored',
      reason: 'no-owner',
      activeOwnerId,
      candidateOwnerIds: [],
      targetKind,
    }
  }

  if (activeOwner.kind === 'temporary-control' && activeOwner.restoreKeys?.(input) === true) {
    const restoreOwnerId = snapshot.returnOwnerIds[snapshot.returnOwnerIds.length - 1] ?? null
    const restoreOwner = restoreOwnerId ? registry.getOwner(restoreOwnerId) : null
    return {
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      activeOwnerId,
      candidateOwnerIds: [activeOwner.id],
      targetKind,
      ownerId: activeOwner.id,
      ownerKind: activeOwner.kind,
      restoreOwnerId,
      restoreTarget: restoreOwner
        ? resolveInteractionRestoreTarget(restoreOwner, { reason: 'cancel', fromOwnerId: activeOwner.id })
        : null,
    }
  }

  if (
    isNativeTextTarget(targetKind)
    && activeOwner.kind !== 'temporary-control'
    && activeOwner.allowsNativeKey?.(input) !== true
  ) {
    return {
      status: 'native',
      reason: 'native-target-protected',
      activeOwnerId,
      candidateOwnerIds: [activeOwner.id],
      targetKind,
    }
  }

  if (ownerAcceptsKey(activeOwner, input)) {
    return ownerRoute('active-owner-handled', activeOwner, input, activeOwnerId, [activeOwner.id], targetKind)
  }

  if (activeOwner.allowsShellKey?.(input) === true) {
    const shellOwner = findShellOwner(registry, input, activeOwner.id)
    const candidateOwnerIds = [activeOwner.id, ...(shellOwner ? [shellOwner.id] : [])]

    if (shellOwner) {
      return ownerRoute('shell-owner-handled', shellOwner, input, activeOwnerId, candidateOwnerIds, targetKind)
    }

    return {
      status: 'ignored',
      reason: 'active-owner-yielded',
      activeOwnerId,
      candidateOwnerIds,
      targetKind,
    }
  }

  return {
    status: 'native',
    reason: 'browser-fallback',
    activeOwnerId,
    candidateOwnerIds: [activeOwner.id],
    targetKind,
  }
}

function ownerRoute(
  reason: 'active-owner-handled' | 'shell-owner-handled',
  owner: InteractionOwner,
  input: InteractionKeyInput,
  activeOwnerId: InteractionOwnerId | null,
  candidateOwnerIds: readonly InteractionOwnerId[],
  targetKind: InteractionKeyTargetKind,
): InteractionRouteResult {
  const matchedKeyRule = matchInteractionKeyRule(owner.diagnostics?.keyRules, input)
  return {
    status: 'owner',
    reason,
    activeOwnerId,
    candidateOwnerIds,
    targetKind,
    ownerId: owner.id,
    ownerKind: owner.kind,
    ...(matchedKeyRule ? { matchedKeyRule } : {}),
  }
}

function ownerAcceptsKey(owner: InteractionOwner, input: InteractionKeyInput): boolean {
  return owner.ownsKey?.(input) ?? true
}

function isNativeTextTarget(targetKind: InteractionKeyTargetKind): boolean {
  return nativeTextTargetKinds.has(targetKind)
}

function findShellOwner(
  registry: Pick<InteractionOwnershipRegistry, 'getOwner' | 'snapshot'>,
  input: InteractionKeyInput,
  excludedOwnerId?: InteractionOwnerId,
  options?: { requireNativeAllowance?: boolean },
): InteractionOwner | null {
  const ownerIds = [...registry.snapshot().ownerIds].reverse()

  for (const ownerId of ownerIds) {
    if (ownerId === excludedOwnerId) continue
    const owner = registry.getOwner(ownerId)
    if (!owner || owner.kind !== 'shell') continue
    if (options?.requireNativeAllowance && owner.allowsNativeKey?.(input) !== true) continue
    if (ownerAcceptsKey(owner, input)) return owner
  }

  return null
}
