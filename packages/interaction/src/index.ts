export {
  createInteractionOwnershipRegistry,
  matchInteractionKeyRule,
  resolveInteractionRestoreTarget,
  type InteractionKeyInput,
  type InteractionKeyTargetKind,
  type InteractionKeyRule,
  type InteractionKeyRuleKind,
  type InteractionMatchedKeyRule,
  type InteractionOwner,
  type InteractionOwnerDiagnostics,
  type InteractionOwnerId,
  type InteractionOwnerKind,
  type InteractionOwnershipRegistry,
  type InteractionOwnershipSnapshot,
  type InteractionRestoreInput,
  type InteractionRestoreReason,
  type InteractionRestoreTarget,
  type InteractionRestoreTargetKind,
  type InteractionRestoreTargetResolver,
} from './interactionOwnership'

export {
  routeInteractionKey,
  type InteractionRouteReason,
  type InteractionRouteResult,
  type InteractionRouteStatus,
} from './interactionRouting'

export { classifyInteractionKeyTarget } from './interactionKeyTarget'

export {
  evaluateInteractionFocusGuard,
  evaluateInteractionFocusTarget,
  type InteractionFocusGuardAction,
  type InteractionFocusGuardInput,
  type InteractionFocusGuardReason,
  type InteractionFocusGuardResult,
} from './interactionFocusGuard'

export {
  createInteractionDiagnosticsSnapshot,
  describeInteractionDomFocus,
  type InteractionDiagnosticsOptions,
  type InteractionDiagnosticsSnapshot,
  type InteractionDomFocusSnapshot,
} from './interactionDiagnostics'

export {
  handleInteractionKeyboardEvent,
  interactionKeyInputFromKeyboardEvent,
  routeInteractionKeyboardEvent,
  type HandleInteractionKeyboardEventOptions,
  type InteractionKeyboardEventLike,
  type InteractionKeyboardEventRoute,
  type InteractionKeyboardRouteCallback,
} from './interactionKeyboardEvent'
