export type InteractionOwnerId = string

export type InteractionOwnerKind = 'pattern' | 'temporary-control' | 'shell'

export type InteractionRestoreReason = 'release' | 'cancel' | 'remove'

export type InteractionRestoreTargetKind =
  | 'invoker'
  | 'previous-owner'
  | 'active-cursor'
  | 'edited-cell'
  | 'first-invalid-field'
  | 'next-logical-target'
  | 'element'

export interface InteractionRestoreTarget {
  kind: InteractionRestoreTargetKind
  ownerId?: InteractionOwnerId
  elementId?: string
  label?: string
}

export type InteractionKeyTargetKind =
  | 'unknown'
  | 'pattern'
  | 'temporary-control'
  | 'text-input'
  | 'textarea'
  | 'select'
  | 'contenteditable'
  | 'native-control'
  | 'scroll-container'
  | 'incidental'

export interface InteractionKeyInput {
  key: string
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  targetKind?: InteractionKeyTargetKind
}

export interface InteractionRestoreInput {
  reason: InteractionRestoreReason
  fromOwnerId: InteractionOwnerId
  target?: InteractionRestoreTarget | null
}

export type InteractionRestoreTargetResolver = (
  input: Omit<InteractionRestoreInput, 'target'>,
) => InteractionRestoreTarget | null

export interface InteractionOwner {
  id: InteractionOwnerId
  kind: InteractionOwnerKind
  ownsKey?: (input: InteractionKeyInput) => boolean
  restoreKeys?: (input: InteractionKeyInput) => boolean
  allowsShellKey?: (input: InteractionKeyInput) => boolean
  restoreTarget?: InteractionRestoreTarget | InteractionRestoreTargetResolver
  restore?: (input: InteractionRestoreInput) => void
}

export interface InteractionOwnershipSnapshot {
  activeOwnerId: InteractionOwnerId | null
  ownerIds: readonly InteractionOwnerId[]
  returnOwnerIds: readonly InteractionOwnerId[]
  restoreTarget: InteractionRestoreTarget | null
}

export interface InteractionOwnershipRegistry {
  register(owner: InteractionOwner): () => void
  activate(ownerId: InteractionOwnerId): InteractionOwner
  release(ownerId: InteractionOwnerId, reason?: InteractionRestoreReason): InteractionOwner | null
  getActiveOwner(): InteractionOwner | null
  getOwner(ownerId: InteractionOwnerId): InteractionOwner | null
  resolveOwnerForKey(input: InteractionKeyInput): InteractionOwner | null
  snapshot(): InteractionOwnershipSnapshot
}

export function createInteractionOwnershipRegistry(): InteractionOwnershipRegistry {
  const owners = new Map<InteractionOwnerId, InteractionOwner>()
  let activeOwnerId: InteractionOwnerId | null = null
  let returnOwnerIds: InteractionOwnerId[] = []

  const getOwner = (ownerId: InteractionOwnerId): InteractionOwner | null => owners.get(ownerId) ?? null

  const getActiveOwner = (): InteractionOwner | null => {
    if (!activeOwnerId) return null
    return getOwner(activeOwnerId)
  }

  const requireOwner = (ownerId: InteractionOwnerId): InteractionOwner => {
    const owner = getOwner(ownerId)
    if (!owner) throw new Error(`[interaction] unknown owner: ${ownerId}`)
    return owner
  }

  const withoutOwner = (ownerIds: readonly InteractionOwnerId[], ownerId: InteractionOwnerId): InteractionOwnerId[] =>
    ownerIds.filter((candidate) => candidate !== ownerId)

  const popReturnOwnerId = (): InteractionOwnerId | null => {
    while (returnOwnerIds.length > 0) {
      const ownerId = returnOwnerIds[returnOwnerIds.length - 1]!
      returnOwnerIds = returnOwnerIds.slice(0, -1)
      if (owners.has(ownerId)) return ownerId
    }
    return null
  }

  const activate = (ownerId: InteractionOwnerId): InteractionOwner => {
    const owner = requireOwner(ownerId)
    if (activeOwnerId === ownerId) return owner

    returnOwnerIds = withoutOwner(returnOwnerIds, ownerId)

    if (owner.kind === 'temporary-control') {
      if (activeOwnerId) returnOwnerIds = [...returnOwnerIds, activeOwnerId]
    } else {
      returnOwnerIds = []
    }

    activeOwnerId = ownerId
    return owner
  }

  const release = (ownerId: InteractionOwnerId, reason: InteractionRestoreReason = 'release'): InteractionOwner | null => {
    requireOwner(ownerId)
    returnOwnerIds = withoutOwner(returnOwnerIds, ownerId)

    if (activeOwnerId !== ownerId) return getActiveOwner()

    activeOwnerId = popReturnOwnerId()
    const restoredOwner = getActiveOwner()
    if (restoredOwner) {
      const restoreInput = { reason, fromOwnerId: ownerId }
      restoredOwner.restore?.({
        ...restoreInput,
        target: resolveInteractionRestoreTarget(restoredOwner, restoreInput),
      })
    }
    return restoredOwner
  }

  return {
    register(owner) {
      if (owners.has(owner.id)) throw new Error(`[interaction] duplicate owner: ${owner.id}`)
      owners.set(owner.id, owner)

      return () => {
        if (!owners.has(owner.id)) return
        if (activeOwnerId === owner.id) release(owner.id, 'remove')
        owners.delete(owner.id)
        returnOwnerIds = withoutOwner(returnOwnerIds, owner.id)
      }
    },
    activate,
    release,
    getActiveOwner,
    getOwner,
    resolveOwnerForKey(input) {
      const owner = getActiveOwner()
      if (!owner) return null
      if (owner.ownsKey?.(input) === false) return null
      return owner
    },
    snapshot() {
      const activeOwner = getActiveOwner()
      return {
        activeOwnerId,
        ownerIds: [...owners.keys()],
        returnOwnerIds,
        restoreTarget: activeOwner
          ? resolveInteractionRestoreTarget(activeOwner, { reason: 'release', fromOwnerId: activeOwner.id })
          : null,
      }
    },
  }
}

export function resolveInteractionRestoreTarget(
  owner: Pick<InteractionOwner, 'id' | 'restoreTarget'>,
  input: Omit<InteractionRestoreInput, 'target'>,
): InteractionRestoreTarget | null {
  if (!owner.restoreTarget) return null
  const target = typeof owner.restoreTarget === 'function'
    ? owner.restoreTarget(input)
    : owner.restoreTarget
  if (!target) return null
  return { ...target, ownerId: target.ownerId ?? owner.id }
}
