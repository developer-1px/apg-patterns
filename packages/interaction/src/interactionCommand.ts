import type {
  InteractionActionDescriptor,
  InteractionKeyModifier,
} from './interactionDefinitionTypes'
import type {
  InteractionPlatform,
} from './interactionOwnership'
import type {
  InteractionShortcutModifier,
} from './interactionShortcut'

export type InteractionCommandShortcutModifier = InteractionShortcutModifier

export interface InteractionCommandKeyboardShortcutDefinition {
  readonly code?: string | readonly string[]
  readonly key: string
  readonly modifier?: InteractionCommandShortcutModifier
  readonly modifiers?: readonly InteractionCommandShortcutModifier[]
  readonly shiftKey?: boolean
}

export interface InteractionCommandPointerInputDefinition {
  readonly modifier?: string
  readonly modifiers?: readonly string[]
  readonly type: string
}

export type InteractionCommandBindingDefinition =
  | {
      readonly kind: 'keyboard'
      readonly label?: string
      readonly shortcut: InteractionCommandKeyboardShortcutDefinition
    }
  | {
      readonly kind: 'pointer'
      readonly label?: string
      readonly pointer: InteractionCommandPointerInputDefinition
    }

export interface InteractionCommandDefinition<
  TBinding extends InteractionCommandBindingDefinition =
    InteractionCommandBindingDefinition,
  TAction extends InteractionActionDescriptor = InteractionActionDescriptor,
> {
  readonly action: TAction
  readonly bindings: readonly TBinding[]
  readonly id: string
  readonly section: string
  readonly title: string
}

export type InteractionCommandCompiledBinding<
  TBinding extends InteractionCommandBindingDefinition =
    InteractionCommandBindingDefinition,
> = TBinding & {
  readonly label: string
}

export type InteractionCommandMapping<
  TDefinition extends InteractionCommandDefinition =
    InteractionCommandDefinition,
> = Omit<TDefinition, 'bindings'> & {
  readonly bindings: readonly InteractionCommandCompiledBinding<
    TDefinition['bindings'][number]
  >[]
}

export interface InteractionCommandLabelOptions {
  readonly platform?: InteractionPlatform
  readonly pointerTypeLabels?: Readonly<Record<string, string>>
  readonly primaryModifierLabel?: string
}

export interface InteractionCommandBindingSummaryInput<
  TBinding extends InteractionCommandCompiledBinding =
    InteractionCommandCompiledBinding,
> {
  readonly bindings: readonly TBinding[]
  readonly isBindingEnabled?: (binding: TBinding) => boolean
  readonly separator?: string
}

export function defineInteractionCommandDefinitions<
  TDefinition extends InteractionCommandDefinition,
>(definitions: readonly TDefinition[]): readonly TDefinition[] {
  return definitions
}

export function compileInteractionCommandDefinitions<
  TDefinition extends InteractionCommandDefinition,
>(
  definitions: readonly TDefinition[],
  options: InteractionCommandLabelOptions = {},
): InteractionCommandMapping<TDefinition>[] {
  return definitions.map((definition) => ({
    ...definition,
    bindings: compileInteractionCommandBindings(definition.bindings, options),
  })) as InteractionCommandMapping<TDefinition>[]
}

export function compileInteractionCommandBindings<
  TBinding extends InteractionCommandBindingDefinition,
>(
  bindings: readonly TBinding[],
  options: InteractionCommandLabelOptions = {},
): InteractionCommandCompiledBinding<TBinding>[] {
  return bindings.map((binding) => ({
    ...binding,
    label: binding.label ?? formatInteractionCommandBinding(binding, options),
  }))
}

export function getInteractionCommandBindingSummary<
  TBinding extends InteractionCommandCompiledBinding,
>({
  bindings,
  isBindingEnabled = () => true,
  separator = ' / ',
}: InteractionCommandBindingSummaryInput<TBinding>): string | undefined {
  const labels = bindings
    .filter((binding) => isBindingEnabled(binding))
    .map((binding) => binding.label)

  return labels.length > 0 ? labels.join(separator) : undefined
}

export function getInteractionCommandMapping<
  TMapping extends { readonly id: string },
>(
  mappings: readonly TMapping[],
  id: string,
): TMapping | undefined {
  return mappings.find((mapping) => mapping.id === id)
}

export function formatInteractionCommandBinding(
  binding: InteractionCommandBindingDefinition,
  options: InteractionCommandLabelOptions = {},
): string {
  return binding.kind === 'keyboard'
    ? formatInteractionCommandKeyboardShortcut(binding.shortcut, options)
    : formatInteractionCommandPointerInput(binding.pointer, options)
}

export function formatInteractionCommandKeyboardShortcut(
  shortcut: InteractionCommandKeyboardShortcutDefinition,
  options: InteractionCommandLabelOptions = {},
): string {
  return [
    ...normalizeInteractionCommandShortcutModifiers(shortcut),
    formatInteractionCommandKey(shortcut.key),
  ]
    .map((part) => formatInteractionCommandKeyboardPart(part, options))
    .join('+')
}

export function formatInteractionCommandPointerInput(
  pointer: InteractionCommandPointerInputDefinition,
  options: InteractionCommandLabelOptions = {},
): string {
  return [
    ...normalizePointerModifiers(pointer),
    options.pointerTypeLabels?.[pointer.type] ?? capitalizeInteractionCommandPart(pointer.type),
  ].join('+')
}

function normalizeInteractionCommandShortcutModifiers({
  modifier,
  modifiers,
  shiftKey,
}: InteractionCommandKeyboardShortcutDefinition): readonly InteractionCommandShortcutModifier[] {
  const normalized = [...(modifiers ?? (modifier ? [modifier] : []))]

  if (shiftKey === true && !normalized.includes('Shift')) {
    normalized.push('Shift')
  }

  return normalized
}

function normalizePointerModifiers(
  pointer: InteractionCommandPointerInputDefinition,
): readonly string[] {
  return pointer.modifiers ?? (pointer.modifier ? [pointer.modifier] : [])
}

function formatInteractionCommandKeyboardPart(
  part: InteractionCommandShortcutModifier | string,
  options: InteractionCommandLabelOptions,
) {
  if (isInteractionShortcutModifier(part)) {
    return formatInteractionCommandShortcutModifier(part, options)
  }

  return part
}

function formatInteractionCommandShortcutModifier(
  modifier: InteractionCommandShortcutModifier,
  options: InteractionCommandLabelOptions,
) {
  if (modifier === 'primary') {
    return options.primaryModifierLabel
      ?? (options.platform === 'windows' || options.platform === 'linux'
        ? 'Ctrl'
        : 'Cmd')
  }

  if (modifier === 'Control') {
    return 'Ctrl'
  }

  if (modifier === 'Meta' && options.platform === 'mac') {
    return 'Cmd'
  }

  return modifier
}

function formatInteractionCommandKey(key: string) {
  return key.length === 1 ? key.toUpperCase() : key
}

function capitalizeInteractionCommandPart(part: string) {
  return part.length === 0
    ? part
    : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
}

function isInteractionShortcutModifier(
  value: string,
): value is InteractionCommandShortcutModifier {
  return value === 'primary' || isInteractionKeyModifier(value)
}

function isInteractionKeyModifier(
  value: string,
): value is InteractionKeyModifier {
  return value === 'Alt'
    || value === 'Control'
    || value === 'Meta'
    || value === 'Shift'
}
