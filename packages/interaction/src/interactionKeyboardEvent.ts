import { classifyInteractionKeyTarget } from './interactionKeyTarget'
import type {
  InteractionKeyInput,
  InteractionPlatform,
  InteractionRestoreReason,
  InteractionOwnershipRegistry,
} from './interactionOwnership'
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

export interface InteractionKeyboardEventInputOptions {
  platform?: InteractionPlatform
  resolvePlatform?: () => InteractionPlatform | undefined
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
  platform?: InteractionPlatform
  resolvePlatform?: () => InteractionPlatform | undefined
  releaseOnRestore?: boolean
  restoreReason?: InteractionRestoreReason
  shouldPreventDefault?: (result: InteractionKeyboardEventRoute, event: InteractionKeyboardEventLike) => boolean
  shouldStopPropagation?: (result: InteractionKeyboardEventRoute, event: InteractionKeyboardEventLike) => boolean
  onOwnerKey?: InteractionKeyboardRouteCallback
  onRestoreKey?: InteractionKeyboardRouteCallback
  onNativeKey?: InteractionKeyboardRouteCallback
  onIgnoredKey?: InteractionKeyboardRouteCallback
}

export function detectInteractionPlatform(input?: {
  platform?: string | null
  userAgent?: string | null
}): InteractionPlatform | undefined {
  const platform = input?.platform ?? readNavigatorPlatform()
  const userAgent = input?.userAgent ?? (input?.platform === undefined ? readNavigatorUserAgent() : undefined)
  const value = `${platform ?? ''} ${userAgent ?? ''}`.toLowerCase()

  if (/(mac|iphone|ipad|ipod|darwin)/.test(value)) return 'mac'
  if (/(win32|win64|windows|wow64)/.test(value)) return 'windows'
  if (/(linux|x11|android)/.test(value)) return 'linux'
  return undefined
}

export function resolveInteractionPrimaryModifier(platform?: InteractionPlatform): 'Meta' | 'Control' {
  return platform === 'mac' ? 'Meta' : 'Control'
}

export function interactionKeyInputFromKeyboardEvent(
  event: InteractionKeyboardEventLike,
  options?: InteractionKeyboardEventInputOptions,
): InteractionKeyInput {
  const platform = event.platform ?? options?.platform ?? options?.resolvePlatform?.()

  return {
    key: event.key,
    ...(event.code !== undefined ? { code: event.code } : {}),
    altKey: event.altKey ?? false,
    ctrlKey: event.ctrlKey ?? false,
    metaKey: event.metaKey ?? false,
    shiftKey: event.shiftKey ?? false,
    ...(platform !== undefined ? { platform } : {}),
    targetKind: classifyInteractionKeyTarget(event.target ?? null),
  }
}

export function routeInteractionKeyboardEvent(
  registry: Pick<InteractionOwnershipRegistry, 'getActiveOwner' | 'getOwner' | 'snapshot'>,
  event: InteractionKeyboardEventLike,
  options?: InteractionKeyboardEventInputOptions,
): InteractionKeyboardEventRoute {
  const input = interactionKeyInputFromKeyboardEvent(event, options)
  return {
    input,
    route: routeInteractionKey(registry, input),
  }
}

export function handleInteractionKeyboardEvent(
  options: HandleInteractionKeyboardEventOptions,
): InteractionKeyboardEventRoute {
  const result = routeInteractionKeyboardEvent(options.registry, options.event, {
    platform: options.platform,
    resolvePlatform: options.resolvePlatform,
  })

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

function readNavigatorPlatform(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  return navigator.platform || undefined
}

function readNavigatorUserAgent(): string | undefined {
  if (typeof navigator === 'undefined') return undefined
  return navigator.userAgent || undefined
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
