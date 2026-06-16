import { compileInteractionOwnerUnchecked } from './interactionDefinitionCompile'
import type {
  InteractionActionDescriptor,
  InteractionFocusStrategy,
  InteractionFocusTarget,
  InteractionKeyModifier,
  InteractionKeyPlatformBinding,
  InteractionKeyRuleDefinition,
  InteractionOwnerDefinition,
  InteractionOwnerDefinitionKind,
  InteractionShellRulesDefinition,
} from './interactionDefinitionTypes'
import type {
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerId,
  InteractionSerializableValue,
} from './interactionOwnership'

export type ApgInteractionFocusModel =
  | 'ariaActiveDescendant'
  | 'focusTrap'
  | 'rovingTabIndex'
  | (string & {})

export interface ApgInteractionEventTemplate {
  readonly direction?: string
  readonly type: string
}

export interface ApgInteractionKeyboardCase {
  readonly events?: readonly ApgInteractionEventTemplate[]
}

export interface ApgInteractionKeyboardBinding {
  readonly cases?: readonly ApgInteractionKeyboardCase[]
  readonly preventDefault?: boolean
  readonly shortcut: string
}

export interface ApgInteractionPatternDefinition {
  readonly apgPattern: string
  readonly focusModel?: ApgInteractionFocusModel
  readonly keyboard?: readonly ApgInteractionKeyboardBinding[]
  readonly rootRole?: string
}

export interface ApgInteractionOwnerOptions {
  readonly actionType?: string
  readonly activeCursorLabel?: string
  readonly definition: ApgInteractionPatternDefinition
  readonly id: InteractionOwnerId
  readonly intent?: string
  readonly kind?: InteractionOwnerDefinitionKind
  readonly label?: string
  readonly restore?: InteractionFocusTarget | null
  readonly shellRules?: InteractionShellRulesDefinition
  readonly source?: string
  readonly stopPropagation?: boolean
  readonly targetKinds?: readonly InteractionKeyTargetKind[]
}

const defaultPatternTargetKinds = [
  'pattern',
  'scroll-container',
  'incidental',
] as const satisfies readonly InteractionKeyTargetKind[]

const defaultPatternTargetPolicy = {
  nativeText: 'protect',
  nativeControl: 'protect',
  incidental: 'restore-owner',
  scroll: 'restore-owner',
} as const

export function defineApgInteractionOwner(
  options: ApgInteractionOwnerOptions,
): InteractionOwnerDefinition {
  const { definition } = options
  const label = options.label ?? definition.apgPattern

  return {
    id: options.id,
    kind: options.kind ?? interactionKindForApgPattern(definition),
    runtimeKind: 'pattern',
    scope: 'region',
    diagnostics: {
      label,
      ...(definition.rootRole ? { role: definition.rootRole } : {}),
      source: options.source ?? `apg:${definition.apgPattern}`,
      intent: options.intent ?? 'route APG pattern keyboard ownership through the interaction layer',
    },
    focus: {
      strategy: interactionFocusStrategyForApg(definition.focusModel),
      containment: 'local',
      restore: options.restore === null
        ? { kind: 'none' }
        : options.restore ?? {
          kind: 'active-cursor',
          label: options.activeCursorLabel ?? label,
        },
      guard: {
        incidental: 'restore',
        scroll: 'restore',
        native: 'allow',
      },
    },
    keyRules: createApgInteractionKeyRules(options),
    ...(options.shellRules ? { shellRules: options.shellRules } : {}),
  }
}

export function createApgInteractionOwner(
  options: ApgInteractionOwnerOptions,
): InteractionOwner {
  return compileInteractionOwnerUnchecked(defineApgInteractionOwner(options))
}

function createApgInteractionKeyRules(
  options: ApgInteractionOwnerOptions,
): InteractionKeyRuleDefinition[] {
  return (options.definition.keyboard ?? []).flatMap((binding) =>
    splitApgShortcuts(binding.shortcut).map((shortcut) => {
      const parsed = parseApgShortcut(shortcut)
      return {
        id: `${options.id}.apg.${ruleIdPart(shortcut)}`,
        kind: inferApgInteractionRuleKind(binding),
        label: formatApgShortcutLabel(shortcut),
        keys: parsed.keys,
        ...(parsed.modifiers.length > 0 ? { modifiers: parsed.modifiers } : {}),
        ...(parsed.platform ? { platform: parsed.platform } : {}),
        targetKinds: options.targetKinds ?? defaultPatternTargetKinds,
        targetPolicy: defaultPatternTargetPolicy,
        action: createApgKeyboardAction(options, shortcut),
        preventDefault: binding.preventDefault ?? true,
        ...(options.stopPropagation !== undefined ? { stopPropagation: options.stopPropagation } : {}),
      } satisfies InteractionKeyRuleDefinition
    }))
}

function createApgKeyboardAction(
  options: ApgInteractionOwnerOptions,
  shortcut: string,
): InteractionActionDescriptor {
  const params: Record<string, InteractionSerializableValue> = {
    apgPattern: options.definition.apgPattern,
    shortcut,
  }
  if (options.definition.rootRole) params.rootRole = options.definition.rootRole

  return {
    type: options.actionType ?? `${options.definition.apgPattern}.keyboard`,
    params,
  }
}

function splitApgShortcuts(shortcut: string): readonly string[] {
  return shortcut.trim().split(/\s+/).filter(Boolean)
}

function parseApgShortcut(shortcut: string): {
  readonly keys: readonly string[]
  readonly modifiers: readonly InteractionKeyModifier[]
  readonly platform?: Partial<Record<'linux' | 'mac' | 'windows', InteractionKeyPlatformBinding>>
} {
  const parts = shortcut.split('+')
  const rawKey = parts[parts.length - 1]
  if (!rawKey) throw new Error(`[interaction] invalid APG shortcut: "${shortcut}"`)

  const keys = normalizeApgKey(rawKey)
  const modifiers: InteractionKeyModifier[] = []
  let primary = false

  for (const rawModifier of parts.slice(0, -1)) {
    if (rawModifier === 'Mod') {
      primary = true
      continue
    }
    modifiers.push(toInteractionModifier(rawModifier, shortcut))
  }

  if (!primary) return { keys, modifiers }

  return {
    keys,
    modifiers: [...modifiers, 'Control'],
    platform: {
      mac: { keys, modifiers: [...modifiers, 'Meta'] },
      windows: { keys, modifiers: [...modifiers, 'Control'] },
      linux: { keys, modifiers: [...modifiers, 'Control'] },
    },
  }
}

function normalizeApgKey(rawKey: string): readonly string[] {
  if (rawKey === 'Space') return [' ', 'Space']
  if (rawKey === 'Plus') return ['+', 'Plus']
  return [rawKey]
}

function toInteractionModifier(
  modifier: string,
  shortcut: string,
): InteractionKeyModifier {
  if (
    modifier === 'Alt'
    || modifier === 'Control'
    || modifier === 'Meta'
    || modifier === 'Shift'
  ) {
    return modifier
  }

  throw new Error(`[interaction] unsupported APG shortcut modifier "${modifier}" in "${shortcut}"`)
}

function inferApgInteractionRuleKind(
  binding: ApgInteractionKeyboardBinding,
): InteractionKeyRuleDefinition['kind'] {
  const eventTypes = (binding.cases ?? [])
    .flatMap((item) => item.events ?? [])
    .map((event) => event.type)

  if (eventTypes.some((type) =>
    type === 'navigate'
    || type === 'focus'
    || type === 'extendSelection'
    || type === 'selectColumn'
    || type === 'selectRow'
  )) {
    return 'navigation'
  }

  return 'command'
}

function interactionFocusStrategyForApg(
  focusModel: ApgInteractionFocusModel | undefined,
): InteractionFocusStrategy {
  if (focusModel === 'ariaActiveDescendant') return 'aria-activedescendant'
  if (focusModel === 'rovingTabIndex') return 'roving-tabindex'
  if (focusModel === 'focusTrap') return 'dom-focus'
  return 'none'
}

function interactionKindForApgPattern(
  definition: ApgInteractionPatternDefinition,
): InteractionOwnerDefinitionKind {
  const pattern = normalizeApgName(definition.apgPattern)
  const role = definition.rootRole ? normalizeApgName(definition.rootRole) : ''

  if (pattern === 'treeview' || pattern === 'tree' || role === 'tree') return 'tree'
  if (pattern === 'treegrid' || role === 'treegrid') return 'treegrid'
  if (pattern === 'grid' || role === 'grid') return 'grid'
  if (pattern === 'listbox' || role === 'listbox') return 'listbox'
  if (pattern === 'menubar' || role === 'menubar') return 'menubar'
  if (pattern === 'menu' || role === 'menu') return 'menu'
  if (pattern === 'toolbar' || role === 'toolbar') return 'toolbar'
  if (pattern === 'dialog' || pattern === 'alertdialog' || role === 'dialog' || role === 'alertdialog') return 'dialog'

  return 'pattern'
}

function normalizeApgName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function ruleIdPart(shortcut: string): string {
  return shortcut.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'key'
}

function formatApgShortcutLabel(shortcut: string): string {
  return `APG ${shortcut}`
}
