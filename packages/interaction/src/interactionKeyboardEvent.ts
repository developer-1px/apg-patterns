import { classifyInteractionKeyTarget } from './interactionKeyTarget'
import type { InteractionKeyInput, InteractionRestoreReason, InteractionOwnershipRegistry } from './interactionOwnership'
import { routeInteractionKey, type InteractionRouteResult } from './interactionRouting'

type InteractionKeyboardRegistry = Pick<
  InteractionOwnershipRegistry,
  'getActiveOwner' | 'getOwner' | 'snapshot' | 'release'
>

export interface InteractionKeyboardEventLike {
  key: string
  code?: string
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  platform?: InteractionKeyInput['platform']
  target?: EventTarget | null
  preventDefault?: () => void
  stopPropagation?: () => void
}

export interface InteractionKeyboardEventRoute {
  input: InteractionKeyInput
  route: InteractionRouteResult
}

export type InteractionKeyboardRouteCallback = (
  result: InteractionKeyboardEventRoute,
  event: InteractionKeyboardEventLike,
) => void

export interface HandleInteractionKeyboardEventOptions {
  registry: InteractionKeyboardRegistry
  event: InteractionKeyboardEventLike
  releaseOnRestore?: boolean
  restoreReason?: InteractionRestoreReason
  shouldPreventDefault?: (result: InteractionKeyboardEventRoute, event: InteractionKeyboardEventLike) => boolean
  shouldStopPropagation?: (result: InteractionKeyboardEventRoute, event: InteractionKeyboardEventLike) => boolean
  onOwnerKey?: InteractionKeyboardRouteCallback
  onRestoreKey?: InteractionKeyboardRouteCallback
  onNativeKey?: InteractionKeyboardRouteCallback
  onIgnoredKey?: InteractionKeyboardRouteCallback
}

export function interactionKeyInputFromKeyboardEvent(event: InteractionKeyboardEventLike): InteractionKeyInput {
  return {
    key: event.key,
    ...(event.code !== undefined ? { code: event.code } : {}),
    altKey: event.altKey ?? false,
    ctrlKey: event.ctrlKey ?? false,
    metaKey: event.metaKey ?? false,
    shiftKey: event.shiftKey ?? false,
    ...(event.platform !== undefined ? { platform: event.platform } : {}),
    targetKind: classifyInteractionKeyTarget(event.target ?? null),
  }
}

export function routeInteractionKeyboardEvent(
  registry: Pick<InteractionOwnershipRegistry, 'getActiveOwner' | 'getOwner' | 'snapshot'>,
  event: InteractionKeyboardEventLike,
): InteractionKeyboardEventRoute {
  const input = interactionKeyInputFromKeyboardEvent(event)
  return {
    input,
    route: routeInteractionKey(registry, input),
  }
}

export function handleInteractionKeyboardEvent(
  options: HandleInteractionKeyboardEventOptions,
): InteractionKeyboardEventRoute {
  const result = routeInteractionKeyboardEvent(options.registry, options.event)

  if (shouldPreventDefault(options, result)) options.event.preventDefault?.()
  if (shouldStopPropagation(options, result)) options.event.stopPropagation?.()

  if (result.route.status === 'owner') {
    options.onOwnerKey?.(result, options.event)
  } else if (result.route.status === 'restore') {
    options.onRestoreKey?.(result, options.event)
    if (options.releaseOnRestore === true && result.route.ownerId) {
      options.registry.release(result.route.ownerId, options.restoreReason ?? 'cancel')
    }
  } else if (result.route.status === 'native') {
    options.onNativeKey?.(result, options.event)
  } else {
    options.onIgnoredKey?.(result, options.event)
  }

  return result
}

function shouldPreventDefault(
  options: HandleInteractionKeyboardEventOptions,
  result: InteractionKeyboardEventRoute,
): boolean {
  if (options.shouldPreventDefault) return options.shouldPreventDefault(result, options.event)
  if (result.route.matchedKeyRule?.preventDefault !== undefined) {
    return result.route.matchedKeyRule.preventDefault
  }
  return result.route.status === 'owner' || result.route.status === 'restore'
}

function shouldStopPropagation(
  options: HandleInteractionKeyboardEventOptions,
  result: InteractionKeyboardEventRoute,
): boolean {
  if (options.shouldStopPropagation) return options.shouldStopPropagation(result, options.event)
  return result.route.matchedKeyRule?.stopPropagation === true
}
