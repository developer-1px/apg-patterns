export {
  createInteractionOwnershipRegistry,
  type InteractionKeyInput,
  type InteractionKeyTargetKind,
  type InteractionOwner,
  type InteractionOwnerId,
  type InteractionOwnerKind,
  type InteractionOwnershipRegistry,
  type InteractionOwnershipSnapshot,
  type InteractionRestoreInput,
  type InteractionRestoreReason,
} from './interactionOwnership'

export {
  routeInteractionKey,
  type InteractionRouteReason,
  type InteractionRouteResult,
  type InteractionRouteStatus,
} from './interactionRouting'

export { classifyInteractionKeyTarget } from './interactionKeyTarget'

export {
  handleInteractionKeyboardEvent,
  interactionKeyInputFromKeyboardEvent,
  routeInteractionKeyboardEvent,
  type HandleInteractionKeyboardEventOptions,
  type InteractionKeyboardEventLike,
  type InteractionKeyboardEventRoute,
  type InteractionKeyboardRouteCallback,
} from './interactionKeyboardEvent'
