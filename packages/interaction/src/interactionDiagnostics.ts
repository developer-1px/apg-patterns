import { classifyInteractionKeyTarget } from './interactionKeyTarget'
import type {
  InteractionKeyTargetKind,
  InteractionOwnerId,
  InteractionOwnerKind,
  InteractionOwnershipRegistry,
  InteractionRestoreTarget,
} from './interactionOwnership'
import type { InteractionFocusGuardResult } from './interactionFocusGuard'
import type { InteractionRouteResult } from './interactionRouting'

type InteractionDiagnosticsRegistry = Pick<
  InteractionOwnershipRegistry,
  'getActiveOwner' | 'snapshot'
>

export interface InteractionDomFocusSnapshot {
  targetKind: InteractionKeyTargetKind
  tagName?: string
  id?: string
  role?: string
  ariaLabel?: string
}

export interface InteractionDiagnosticsOptions {
  activeElement?: EventTarget | null
  route?: InteractionRouteResult | null
  focusGuard?: InteractionFocusGuardResult | null
}

export interface InteractionDiagnosticsSnapshot {
  activeOwnerId: InteractionOwnerId | null
  activeOwnerKind: InteractionOwnerKind | null
  ownerIds: readonly InteractionOwnerId[]
  returnOwnerIds: readonly InteractionOwnerId[]
  ownerStack: readonly InteractionOwnerId[]
  restoreTarget: InteractionRestoreTarget | null
  domFocus: InteractionDomFocusSnapshot
  route?: {
    status: InteractionRouteResult['status']
    reason: InteractionRouteResult['reason']
    targetKind: InteractionRouteResult['targetKind']
    ownerId?: InteractionOwnerId
    ownerKind?: InteractionOwnerKind
    candidateOwnerIds: readonly InteractionOwnerId[]
    restoreOwnerId?: InteractionOwnerId | null
    restoreTarget?: InteractionRestoreTarget | null
    ignoredReason?: InteractionRouteResult['reason']
  }
  focusGuard?: {
    action: InteractionFocusGuardResult['action']
    reason: InteractionFocusGuardResult['reason']
    targetKind: InteractionFocusGuardResult['targetKind']
    targetOwnerId?: InteractionOwnerId | null
    restoreTarget?: InteractionRestoreTarget | null
    intervention: boolean
  }
}

export function createInteractionDiagnosticsSnapshot(
  registry: InteractionDiagnosticsRegistry,
  options: InteractionDiagnosticsOptions = {},
): InteractionDiagnosticsSnapshot {
  const snapshot = registry.snapshot()
  const activeOwner = registry.getActiveOwner()
  const routeRestoreTarget = options.route?.restoreTarget ?? null
  const focusGuardRestoreTarget = options.focusGuard?.restoreTarget ?? null
  const restoreTarget = routeRestoreTarget ?? focusGuardRestoreTarget ?? snapshot.restoreTarget

  return {
    activeOwnerId: snapshot.activeOwnerId,
    activeOwnerKind: activeOwner?.kind ?? null,
    ownerIds: snapshot.ownerIds,
    returnOwnerIds: snapshot.returnOwnerIds,
    ownerStack: [...snapshot.returnOwnerIds, ...(snapshot.activeOwnerId ? [snapshot.activeOwnerId] : [])],
    restoreTarget,
    domFocus: describeInteractionDomFocus(options.activeElement ?? null),
    route: options.route ? describeInteractionRoute(options.route) : undefined,
    focusGuard: options.focusGuard ? describeInteractionFocusGuard(options.focusGuard) : undefined,
  }
}

export function describeInteractionDomFocus(target: EventTarget | null): InteractionDomFocusSnapshot {
  const targetKind = classifyInteractionKeyTarget(target)
  if (!(target instanceof Element)) return { targetKind }

  const role = target.getAttribute('role') ?? undefined
  const ariaLabel = target.getAttribute('aria-label') ?? undefined
  return {
    targetKind,
    tagName: target.tagName.toLowerCase(),
    id: target.id || undefined,
    role,
    ariaLabel,
  }
}

function describeInteractionRoute(route: InteractionRouteResult): NonNullable<InteractionDiagnosticsSnapshot['route']> {
  return {
    status: route.status,
    reason: route.reason,
    targetKind: route.targetKind,
    ownerId: route.ownerId,
    ownerKind: route.ownerKind,
    candidateOwnerIds: route.candidateOwnerIds,
    restoreOwnerId: route.restoreOwnerId,
    restoreTarget: route.restoreTarget,
    ignoredReason: route.status === 'ignored' || route.status === 'native' ? route.reason : undefined,
  }
}

function describeInteractionFocusGuard(
  focusGuard: InteractionFocusGuardResult,
): NonNullable<InteractionDiagnosticsSnapshot['focusGuard']> {
  return {
    action: focusGuard.action,
    reason: focusGuard.reason,
    targetKind: focusGuard.targetKind,
    targetOwnerId: focusGuard.targetOwnerId,
    restoreTarget: focusGuard.restoreTarget,
    intervention: focusGuard.reason === 'focus-guard-intervention',
  }
}
