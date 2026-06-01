import type {
  InteractionKeyAction,
  InteractionKeyInput,
  InteractionKeyRuleKind,
  InteractionKeyTargetKind,
  InteractionOwnerKind,
  InteractionPlatform,
  InteractionSerializableValue,
} from './interactionOwnership'

export type InteractionKeyModifier = 'Alt' | 'Control' | 'Meta' | 'Shift'

export type InteractionOwnerDefinitionKind =
  | 'tree'
  | 'treegrid'
  | 'grid'
  | 'listbox'
  | 'menu'
  | 'menubar'
  | 'toolbar'
  | 'dialog'
  | 'popover'
  | 'input'
  | 'form'
  | 'editor'
  | 'scroll-region'
  | 'shell'
  | 'custom'
  | 'pattern'
  | 'temporary-control'
  | 'native-control'

export type InteractionOwnerRuntimeKind = InteractionOwnerKind

export type InteractionOwnerScope = 'shell' | 'region' | 'modal' | 'local'

export type InteractionFocusStrategy = 'none' | 'roving-tabindex' | 'aria-activedescendant' | 'dom-focus'

export type InteractionFocusContainment = 'none' | 'modal' | 'local'

export type InteractionFocusTarget =
  | {
    readonly kind:
      | 'none'
      | 'first'
      | 'selected'
      | 'last-active'
      | 'invoker'
      | 'previous-owner'
      | 'active-cursor'
      | 'edited-cell'
      | 'first-invalid-field'
      | 'next-logical-target'
    readonly label?: string
  }
  | {
    readonly kind: 'element'
    readonly elementId: string
    readonly label?: string
  }

export interface InteractionFocusGuardPolicy {
  readonly incidental?: 'allow' | 'restore' | 'block'
  readonly scroll?: 'allow' | 'restore' | 'block'
  readonly native?: 'allow' | 'restore' | 'block'
}

export interface InteractionFocusDefinition {
  readonly strategy?: InteractionFocusStrategy
  readonly containment?: InteractionFocusContainment
  readonly initial?: InteractionFocusTarget
  readonly restore?: InteractionFocusTarget
  readonly guard?: InteractionFocusGuardPolicy
}

export interface InteractionTargetPolicy {
  readonly nativeText?: 'protect' | 'allow-owner' | 'allow-shell'
  readonly nativeControl?: 'protect' | 'allow-owner' | 'allow-shell'
  readonly incidental?: 'restore-owner' | 'allow-target' | 'block'
  readonly scroll?: 'restore-owner' | 'allow-target' | 'block'
}

export interface InteractionActionDescriptor<TParams extends InteractionSerializableValue = InteractionSerializableValue>
  extends InteractionKeyAction {
  readonly type: string
  readonly params?: TParams
}

export interface InteractionKeyPlatformBinding {
  readonly keys: readonly string[]
  readonly code?: readonly string[]
  readonly modifiers?: readonly InteractionKeyModifier[]
}

export type InteractionCondition =
  | {
    readonly type: 'target.kind'
    readonly equals?: InteractionKeyTargetKind
    readonly in?: readonly InteractionKeyTargetKind[]
  }
  | {
    readonly type: 'owner.kind'
    readonly equals?: InteractionOwnerDefinitionKind
    readonly in?: readonly InteractionOwnerDefinitionKind[]
  }
  | {
    readonly type: 'owner.mode'
    readonly equals?: string
    readonly in?: readonly string[]
  }
  | {
    readonly type: 'key.value'
    readonly equals?: string
    readonly in?: readonly string[]
  }
  | {
    readonly type: 'key.modifier'
    readonly includes: InteractionKeyModifier
  }
  | {
    readonly type: 'context.value'
    readonly key: string
    readonly equals?: InteractionSerializableValue
    readonly in?: readonly InteractionSerializableValue[]
  }
  | {
    readonly type: 'all'
    readonly conditions: readonly InteractionCondition[]
  }
  | {
    readonly type: 'any'
    readonly conditions: readonly InteractionCondition[]
  }
  | {
    readonly type: 'not'
    readonly condition: InteractionCondition
  }

export interface InteractionKeyRuleDefinition<TAction extends InteractionKeyAction = InteractionActionDescriptor> {
  readonly id: string
  readonly kind?: InteractionKeyRuleKind
  readonly label?: string
  readonly description?: string
  readonly keys: readonly string[]
  readonly code?: readonly string[]
  readonly modifiers?: readonly InteractionKeyModifier[]
  readonly platform?: Partial<Record<InteractionPlatform, InteractionKeyPlatformBinding>>
  readonly targetKinds?: readonly InteractionKeyTargetKind[]
  readonly targetPolicy?: InteractionTargetPolicy
  readonly when?: InteractionCondition
  readonly action: TAction
  readonly preventDefault?: boolean
  readonly stopPropagation?: boolean
}

export interface InteractionShellRulesDefinition {
  readonly allowGlobal?: boolean
  readonly blockWhen?: InteractionCondition
}

export interface InteractionOwnerDiagnosticsDefinition {
  readonly label?: string
  readonly role?: string
  readonly source?: string
  readonly intent?: string
}

export interface InteractionOwnerDefinition<TAction extends InteractionKeyAction = InteractionActionDescriptor> {
  readonly id: string
  readonly kind: InteractionOwnerDefinitionKind
  readonly runtimeKind?: InteractionOwnerRuntimeKind
  readonly priority?: number
  readonly scope?: InteractionOwnerScope
  readonly mode?: string
  readonly focus?: InteractionFocusDefinition
  readonly keyRules?: readonly InteractionKeyRuleDefinition<TAction>[]
  readonly shellRules?: InteractionShellRulesDefinition
  readonly diagnostics?: InteractionOwnerDiagnosticsDefinition
}

export interface InteractionDefinitionKeyInput extends InteractionKeyInput {
  readonly context?: Readonly<Record<string, InteractionSerializableValue>>
}
