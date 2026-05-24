import type {
  InteractionKeyInput,
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerId,
  InteractionOwnerKind,
  InteractionOwnershipRegistry,
} from './interactionOwnership'

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
  restoreOwnerId?: InteractionOwnerId | null
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
      return ownerRoute('shell-owner-handled', shellOwner, activeOwnerId, [shellOwner.id], targetKind)
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
    return {
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      activeOwnerId,
      candidateOwnerIds: [activeOwner.id],
      targetKind,
      ownerId: activeOwner.id,
      ownerKind: activeOwner.kind,
      restoreOwnerId: snapshot.returnOwnerIds[snapshot.returnOwnerIds.length - 1] ?? null,
    }
  }

  if (isNativeTextTarget(targetKind) && activeOwner.kind !== 'temporary-control') {
    return {
      status: 'native',
      reason: 'native-target-protected',
      activeOwnerId,
      candidateOwnerIds: [activeOwner.id],
      targetKind,
    }
  }

  if (ownerAcceptsKey(activeOwner, input)) {
    return ownerRoute('active-owner-handled', activeOwner, activeOwnerId, [activeOwner.id], targetKind)
  }

  if (activeOwner.allowsShellKey?.(input) === true) {
    const shellOwner = findShellOwner(registry, input, activeOwner.id)
    const candidateOwnerIds = [activeOwner.id, ...(shellOwner ? [shellOwner.id] : [])]

    if (shellOwner) {
      return ownerRoute('shell-owner-handled', shellOwner, activeOwnerId, candidateOwnerIds, targetKind)
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
  activeOwnerId: InteractionOwnerId | null,
  candidateOwnerIds: readonly InteractionOwnerId[],
  targetKind: InteractionKeyTargetKind,
): InteractionRouteResult {
  return {
    status: 'owner',
    reason,
    activeOwnerId,
    candidateOwnerIds,
    targetKind,
    ownerId: owner.id,
    ownerKind: owner.kind,
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
): InteractionOwner | null {
  const ownerIds = [...registry.snapshot().ownerIds].reverse()

  for (const ownerId of ownerIds) {
    if (ownerId === excludedOwnerId) continue
    const owner = registry.getOwner(ownerId)
    if (!owner || owner.kind !== 'shell') continue
    if (ownerAcceptsKey(owner, input)) return owner
  }

  return null
}
