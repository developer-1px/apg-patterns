import { compileInteractionOwnerUnchecked } from './interactionDefinitionCompile'
import type {
  InteractionActionDescriptor,
  InteractionKeyModifier,
  InteractionKeyPlatformBinding,
  InteractionKeyRuleDefinition,
  InteractionOwnerDefinition,
  InteractionTargetPolicy,
} from './interactionDefinitionTypes'
import type { InteractionActionDescriptorFor, InteractionActionMap } from './interactionActions'
import type {
  InteractionKeyInput,
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerId,
  InteractionOwnershipRegistry,
  InteractionPlatform,
  InteractionRestoreReason,
} from './interactionOwnership'
import { createInteractionOwnershipRegistry } from './interactionOwnership'
import {
  handleInteractionKeyboardEvent,
  routeInteractionKeyboardEvent,
  type HandleInteractionKeyboardEventOptions,
  type InteractionKeyboardEventLike,
  type InteractionKeyboardEventRoute,
} from './interactionKeyboardEvent'
import { routeInteractionKey, type InteractionRouteResult } from './interactionRouting'

export type InteractionShortcutModifier = InteractionKeyModifier | 'primary'

export type InteractionShortcutAction<TActions extends InteractionActionMap = InteractionActionMap> =
  | (keyof TActions & string)
  | InteractionActionDescriptorFor<TActions>
  | InteractionActionDescriptor

export interface InteractionShortcutBinding<TActions extends InteractionActionMap = InteractionActionMap> {
  readonly key: string
  readonly code?: string | readonly string[]
  readonly mod?: InteractionShortcutModifier | readonly InteractionShortcutModifier[]
  readonly modifiers?: readonly InteractionShortcutModifier[]
  readonly action: InteractionShortcutAction<TActions>
  readonly label?: string
  readonly targetKinds?: readonly InteractionKeyTargetKind[]
  readonly targetPolicy?: InteractionTargetPolicy
  readonly preventDefault?: boolean
  readonly stopPropagation?: boolean
}

export type InteractionShortcutKeyMap<TActions extends InteractionActionMap = InteractionActionMap> = Readonly<
  Record<
    string,
    | InteractionShortcutAction<TActions>
    | Omit<InteractionShortcutBinding<TActions>, 'key'>
  >
>

export type InteractionShortcutList<TActions extends InteractionActionMap = InteractionActionMap> =
  | readonly InteractionShortcutBinding<TActions>[]
  | InteractionShortcutKeyMap<TActions>

export interface InteractionShortcutOwnerOptions<TActions extends InteractionActionMap = InteractionActionMap> {
  readonly id: InteractionOwnerId
  readonly label?: string
  readonly keys?: InteractionShortcutList<TActions>
  readonly targetKinds?: readonly InteractionKeyTargetKind[]
  readonly preventDefault?: boolean
  readonly stopPropagation?: boolean
}

export interface InteractionShellOwnerOptions<TActions extends InteractionActionMap = InteractionActionMap>
  extends InteractionShortcutOwnerOptions<TActions> {
  readonly allowNativeText?: boolean
  readonly allowNativeControl?: boolean
}

export interface InteractionTemporaryControlOptions<TActions extends InteractionActionMap = InteractionActionMap>
  extends InteractionShortcutOwnerOptions<TActions> {
  readonly restore?: readonly string[] | InteractionShortcutList<TActions>
}

export interface InteractionRouterOptions {
  readonly owners?: readonly InteractionOwner[]
  readonly activeOwnerId?: InteractionOwnerId
  readonly platform?: InteractionPlatform
  readonly resolvePlatform?: () => InteractionPlatform | undefined
}

export interface InteractionRouter {
  readonly registry: InteractionOwnershipRegistry
  register(owner: InteractionOwner, options?: { readonly active?: boolean }): () => void
  activate(ownerId: InteractionOwnerId): InteractionOwner
  release(ownerId: InteractionOwnerId, reason?: InteractionRestoreReason): InteractionOwner | null
  route(input: InteractionKeyInput): InteractionRouteResult
  routeEvent(event: InteractionKeyboardEventLike): InteractionKeyboardEventRoute
  handleEvent(
    event: InteractionKeyboardEventLike,
    options?: Omit<HandleInteractionKeyboardEventOptions, 'registry' | 'event' | 'platform' | 'resolvePlatform'>,
  ): InteractionKeyboardEventRoute
}

export function createInteractionRouter(options: InteractionRouterOptions = {}): InteractionRouter {
  const registry = createInteractionOwnershipRegistry()

  for (const owner of options.owners ?? []) {
    registry.register(owner)
  }
  if (options.activeOwnerId) registry.activate(options.activeOwnerId)

  const resolvePlatform = (): InteractionPlatform | undefined => options.platform ?? options.resolvePlatform?.()

  return {
    registry,
    register(owner, registerOptions) {
      const unregister = registry.register(owner)
      if (registerOptions?.active === true) registry.activate(owner.id)
      return unregister
    },
    activate(ownerId) {
      return registry.activate(ownerId)
    },
    release(ownerId, reason) {
      return registry.release(ownerId, reason)
    },
    route(input) {
      return routeInteractionKey(registry, {
        ...input,
        platform: input.platform ?? resolvePlatform(),
      })
    },
    routeEvent(event) {
      return routeInteractionKeyboardEvent(registry, event, { resolvePlatform })
    },
    handleEvent(event, handleOptions) {
      return handleInteractionKeyboardEvent({
        ...handleOptions,
        registry,
        event,
        resolvePlatform,
      })
    },
  }
}

export function shellOwner<TActions extends InteractionActionMap = InteractionActionMap>(
  options: InteractionShellOwnerOptions<TActions>,
): InteractionOwner {
  return compileInteractionOwnerUnchecked({
    id: options.id,
    kind: 'shell',
    runtimeKind: 'shell',
    scope: 'shell',
    diagnostics: toDiagnostics(options),
    keyRules: shortcutRules(options.keys, {
      kind: 'shell',
      idPrefix: options.id,
      targetKinds: options.targetKinds,
      targetPolicy: shellTargetPolicy(options),
      preventDefault: options.preventDefault,
      stopPropagation: options.stopPropagation,
    }),
  })
}

export function temporaryControl<TActions extends InteractionActionMap = InteractionActionMap>(
  options: InteractionTemporaryControlOptions<TActions>,
): InteractionOwner {
  return compileInteractionOwnerUnchecked({
    id: options.id,
    kind: 'temporary-control',
    runtimeKind: 'temporary-control',
    scope: 'local',
    diagnostics: toDiagnostics(options),
    keyRules: [
      ...shortcutRules(options.keys, {
        kind: 'command',
        idPrefix: options.id,
        targetKinds: options.targetKinds,
        preventDefault: options.preventDefault,
        stopPropagation: options.stopPropagation,
      }),
      ...restoreRules(options.restore, {
        idPrefix: options.id,
        targetKinds: options.targetKinds,
      }),
    ],
  })
}

function shortcutRules<TActions extends InteractionActionMap>(
  shortcuts: InteractionShortcutList<TActions> | undefined,
  options: {
    readonly kind: InteractionKeyRuleDefinition['kind']
    readonly idPrefix: string
    readonly targetKinds?: readonly InteractionKeyTargetKind[]
    readonly targetPolicy?: InteractionTargetPolicy
    readonly preventDefault?: boolean
    readonly stopPropagation?: boolean
  },
): InteractionKeyRuleDefinition[] {
  return normalizeShortcutBindings(shortcuts).map((binding) => toKeyRule(binding, options))
}

function restoreRules<TActions extends InteractionActionMap>(
  restore: readonly string[] | InteractionShortcutList<TActions> | undefined,
  options: {
    readonly idPrefix: string
    readonly targetKinds?: readonly InteractionKeyTargetKind[]
  },
): InteractionKeyRuleDefinition[] {
  if (!restore) return []
  if (Array.isArray(restore) && restore.every((key): key is string => typeof key === 'string')) {
    return restore.map((key) => toKeyRule({
      key,
      action: { type: 'owner.restore' },
    }, {
      kind: 'restore',
      idPrefix: options.idPrefix,
      targetKinds: options.targetKinds,
      preventDefault: true,
    }))
  }
  return normalizeShortcutBindings(restore as InteractionShortcutList<TActions>).map((binding) => toKeyRule(binding, {
    kind: 'restore',
    idPrefix: options.idPrefix,
    targetKinds: options.targetKinds,
    preventDefault: true,
  }))
}

function normalizeShortcutBindings<TActions extends InteractionActionMap>(
  shortcuts: InteractionShortcutList<TActions> | undefined,
): InteractionShortcutBinding<TActions>[] {
  if (!shortcuts) return []
  if (Array.isArray(shortcuts)) return [...shortcuts]

  return Object.entries(shortcuts).map(([key, value]) => {
    if (typeof value === 'string' || isActionDescriptor(value)) {
      return { key, action: value as InteractionShortcutAction<TActions> }
    }
    return { ...value, key } as InteractionShortcutBinding<TActions>
  })
}

function toKeyRule<TActions extends InteractionActionMap>(
  binding: InteractionShortcutBinding<TActions>,
  options: {
    readonly kind: InteractionKeyRuleDefinition['kind']
    readonly idPrefix: string
    readonly targetKinds?: readonly InteractionKeyTargetKind[]
    readonly targetPolicy?: InteractionTargetPolicy
    readonly preventDefault?: boolean
    readonly stopPropagation?: boolean
  },
): InteractionKeyRuleDefinition {
  const code = toArray(binding.code)
  const modifiers = normalizeShortcutModifiers(binding.modifiers ?? binding.mod)
  const stopPropagation = binding.stopPropagation ?? options.stopPropagation
  const platform = primaryPlatformBindings(binding.key, code, modifiers)
  const targetKinds = binding.targetKinds ?? options.targetKinds
  const targetPolicy = binding.targetPolicy ?? options.targetPolicy

  return {
    id: `${options.idPrefix}.${options.kind}.${binding.key}`,
    kind: options.kind,
    ...(binding.label !== undefined ? { label: binding.label } : {}),
    keys: [binding.key],
    ...(code ? { code } : {}),
    modifiers: toPlatformModifiers(modifiers, 'windows'),
    ...(platform ? { platform } : {}),
    ...(targetKinds ? { targetKinds } : {}),
    ...(targetPolicy ? { targetPolicy } : {}),
    action: toActionDescriptor(binding.action),
    preventDefault: binding.preventDefault ?? options.preventDefault ?? true,
    ...(stopPropagation !== undefined ? { stopPropagation } : {}),
  }
}

function primaryPlatformBindings(
  key: string,
  code: readonly string[] | undefined,
  modifiers: readonly InteractionShortcutModifier[],
): InteractionKeyRuleDefinition['platform'] {
  if (!modifiers.includes('primary')) return undefined
  return {
    mac: platformBinding(key, code, modifiers, 'mac'),
    windows: platformBinding(key, code, modifiers, 'windows'),
    linux: platformBinding(key, code, modifiers, 'linux'),
  }
}

function platformBinding(
  key: string,
  code: readonly string[] | undefined,
  modifiers: readonly InteractionShortcutModifier[],
  platform: InteractionPlatform,
): InteractionKeyPlatformBinding {
  return {
    keys: [key],
    ...(code ? { code } : {}),
    modifiers: toPlatformModifiers(modifiers, platform),
  }
}

function toDiagnostics(options: { readonly label?: string }): InteractionOwnerDefinition['diagnostics'] {
  return options.label ? { label: options.label } : undefined
}

function shellTargetPolicy(options: {
  readonly allowNativeText?: boolean
  readonly allowNativeControl?: boolean
}): InteractionTargetPolicy | undefined {
  if (options.allowNativeText !== true && options.allowNativeControl !== true) return undefined
  return {
    ...(options.allowNativeText === true ? { nativeText: 'allow-shell' } : {}),
    ...(options.allowNativeControl === true ? { nativeControl: 'allow-shell' } : {}),
  }
}

function isActionDescriptor(value: unknown): value is InteractionActionDescriptor {
  return typeof value === 'object'
    && value !== null
    && 'type' in value
    && typeof (value as { readonly type?: unknown }).type === 'string'
}

function toActionDescriptor<TActions extends InteractionActionMap>(
  action: InteractionShortcutAction<TActions>,
): InteractionActionDescriptor {
  if (typeof action === 'string') return { type: action }
  return action as InteractionActionDescriptor
}

function toArray(value: string | readonly string[] | undefined): readonly string[] | undefined {
  if (value === undefined) return undefined
  return typeof value === 'string' ? [value] : value
}

function normalizeShortcutModifiers(
  modifiers: InteractionShortcutModifier | readonly InteractionShortcutModifier[] | undefined,
): readonly InteractionShortcutModifier[] {
  if (!modifiers) return []
  return typeof modifiers === 'string' ? [modifiers] : modifiers
}

function toPlatformModifiers(
  modifiers: readonly InteractionShortcutModifier[],
  platform: InteractionPlatform,
): readonly InteractionKeyModifier[] {
  return modifiers.map((modifier) => {
    if (modifier !== 'primary') return modifier
    return platform === 'mac' ? 'Meta' : 'Control'
  })
}
