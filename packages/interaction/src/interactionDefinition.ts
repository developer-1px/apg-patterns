import { z } from 'zod'

import type {
  InteractionKeyInput,
  InteractionKeyRule,
  InteractionKeyRuleKind,
  InteractionKeyTargetKind,
  InteractionOwner,
  InteractionOwnerKind,
  InteractionRestoreTarget,
} from './interactionOwnership'

export type InteractionSerializableValue =
  | string
  | number
  | boolean
  | null
  | readonly InteractionSerializableValue[]
  | { readonly [key: string]: InteractionSerializableValue }

export const InteractionSerializableValueSchema: z.ZodType<InteractionSerializableValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(InteractionSerializableValueSchema),
    z.record(z.string(), InteractionSerializableValueSchema),
  ]),
)

export const InteractionKeyTargetKindSchema = z.enum([
  'unknown',
  'pattern',
  'temporary-control',
  'text-input',
  'textarea',
  'select',
  'contenteditable',
  'native-control',
  'scroll-container',
  'incidental',
])

export const InteractionOwnerDefinitionKindSchema = z.enum([
  'tree',
  'treegrid',
  'grid',
  'listbox',
  'menu',
  'menubar',
  'toolbar',
  'dialog',
  'popover',
  'input',
  'form',
  'editor',
  'scroll-region',
  'shell',
  'custom',
  'pattern',
  'temporary-control',
  'native-control',
])

export const InteractionOwnerRuntimeKindSchema = z.enum(['pattern', 'temporary-control', 'shell'])

export const InteractionKeyRuleKindSchema = z.enum(['navigation', 'command', 'restore', 'shell', 'custom'])

export const InteractionKeyModifierSchema = z.enum(['Alt', 'Control', 'Meta', 'Shift'])

export const InteractionOwnerScopeSchema = z.enum(['shell', 'region', 'modal', 'local'])

export const InteractionFocusStrategySchema = z.enum([
  'none',
  'roving-tabindex',
  'aria-activedescendant',
  'dom-focus',
])

export const InteractionFocusContainmentSchema = z.enum(['none', 'modal', 'local'])

export const InteractionFocusTargetSchema = z.union([
  z.object({
    kind: z.enum([
      'none',
      'first',
      'selected',
      'last-active',
      'invoker',
      'previous-owner',
      'active-cursor',
      'edited-cell',
      'first-invalid-field',
      'next-logical-target',
    ]),
    label: z.string().min(1).optional(),
  }).strict(),
  z.object({
    kind: z.literal('element'),
    elementId: z.string().min(1),
    label: z.string().min(1).optional(),
  }).strict(),
])

export const InteractionFocusGuardPolicySchema = z.object({
  incidental: z.enum(['allow', 'restore', 'block']).default('restore'),
  scroll: z.enum(['allow', 'restore', 'block']).default('restore'),
  native: z.enum(['allow', 'restore', 'block']).default('allow'),
}).strict()

export const InteractionFocusDefinitionSchema = z.object({
  strategy: InteractionFocusStrategySchema.default('none'),
  containment: InteractionFocusContainmentSchema.default('none'),
  initial: InteractionFocusTargetSchema.optional(),
  restore: InteractionFocusTargetSchema.optional(),
  guard: InteractionFocusGuardPolicySchema.optional(),
}).strict()

export const InteractionTargetPolicySchema = z.object({
  nativeText: z.enum(['protect', 'allow-owner', 'allow-shell']).default('protect'),
  nativeControl: z.enum(['protect', 'allow-owner', 'allow-shell']).default('protect'),
  incidental: z.enum(['restore-owner', 'allow-target', 'block']).default('restore-owner'),
  scroll: z.enum(['restore-owner', 'allow-target', 'block']).default('restore-owner'),
}).strict()

export const InteractionActionDescriptorSchema = z.object({
  type: z.string().min(1),
  params: InteractionSerializableValueSchema.optional(),
}).strict()

export const InteractionKeyPlatformBindingSchema = z.object({
  keys: z.array(z.string().min(1)).min(1),
  modifiers: z.array(InteractionKeyModifierSchema).default([]),
}).strict()

const InteractionConditionAtomSchema = z.union([
  z.object({
    type: z.literal('target.kind'),
    equals: InteractionKeyTargetKindSchema.optional(),
    in: z.array(InteractionKeyTargetKindSchema).min(1).optional(),
  }).strict(),
  z.object({
    type: z.literal('owner.kind'),
    equals: InteractionOwnerDefinitionKindSchema.optional(),
    in: z.array(InteractionOwnerDefinitionKindSchema).min(1).optional(),
  }).strict(),
  z.object({
    type: z.literal('owner.mode'),
    equals: z.string().min(1).optional(),
    in: z.array(z.string().min(1)).min(1).optional(),
  }).strict(),
  z.object({
    type: z.literal('key.value'),
    equals: z.string().min(1).optional(),
    in: z.array(z.string().min(1)).min(1).optional(),
  }).strict(),
  z.object({
    type: z.literal('key.modifier'),
    includes: InteractionKeyModifierSchema,
  }).strict(),
  z.object({
    type: z.literal('context.value'),
    key: z.string().min(1),
    equals: InteractionSerializableValueSchema.optional(),
    in: z.array(InteractionSerializableValueSchema).min(1).optional(),
  }).strict(),
]).superRefine((condition, context) => {
  if ('equals' in condition || 'in' in condition) {
    if (condition.equals === undefined && condition.in === undefined) {
      context.addIssue({
        code: 'custom',
        message: 'condition must define equals or in',
      })
    }
  }
})

export type InteractionCondition =
  | z.infer<typeof InteractionConditionAtomSchema>
  | { readonly type: 'all'; readonly conditions: readonly InteractionCondition[] }
  | { readonly type: 'any'; readonly conditions: readonly InteractionCondition[] }
  | { readonly type: 'not'; readonly condition: InteractionCondition }

export const InteractionConditionSchema: z.ZodType<InteractionCondition> = z.lazy(() =>
  z.union([
    InteractionConditionAtomSchema,
    z.object({
      type: z.literal('all'),
      conditions: z.array(InteractionConditionSchema).min(1),
    }).strict(),
    z.object({
      type: z.literal('any'),
      conditions: z.array(InteractionConditionSchema).min(1),
    }).strict(),
    z.object({
      type: z.literal('not'),
      condition: InteractionConditionSchema,
    }).strict(),
  ]),
)

export const InteractionKeyRuleDefinitionSchema = z.object({
  id: z.string().min(1),
  kind: InteractionKeyRuleKindSchema.default('custom'),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keys: z.array(z.string().min(1)).min(1),
  code: z.array(z.string().min(1)).min(1).optional(),
  modifiers: z.array(InteractionKeyModifierSchema).default([]),
  platform: z.object({
    mac: InteractionKeyPlatformBindingSchema.optional(),
    windows: InteractionKeyPlatformBindingSchema.optional(),
    linux: InteractionKeyPlatformBindingSchema.optional(),
  }).strict().optional(),
  targetKinds: z.array(InteractionKeyTargetKindSchema).min(1).optional(),
  targetPolicy: InteractionTargetPolicySchema.optional(),
  when: InteractionConditionSchema.optional(),
  action: InteractionActionDescriptorSchema,
  preventDefault: z.boolean().optional(),
  stopPropagation: z.boolean().optional(),
}).strict()

export const InteractionShellRulesDefinitionSchema = z.object({
  allowGlobal: z.boolean().default(false),
  blockWhen: InteractionConditionSchema.optional(),
}).strict()

export const InteractionOwnerDiagnosticsDefinitionSchema = z.object({
  label: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  intent: z.string().min(1).optional(),
}).strict()

export const InteractionOwnerDefinitionSchema = z.object({
  id: z.string().min(1),
  kind: InteractionOwnerDefinitionKindSchema,
  runtimeKind: InteractionOwnerRuntimeKindSchema.optional(),
  priority: z.number().int().default(0),
  scope: InteractionOwnerScopeSchema.default('local'),
  mode: z.string().min(1).optional(),
  focus: InteractionFocusDefinitionSchema.optional(),
  keyRules: z.array(InteractionKeyRuleDefinitionSchema).default([]),
  shellRules: InteractionShellRulesDefinitionSchema.optional(),
  diagnostics: InteractionOwnerDiagnosticsDefinitionSchema.optional(),
}).strict().superRefine((definition, context) => {
  const keyRuleIds = new Set<string>()

  for (const [index, rule] of definition.keyRules.entries()) {
    if (keyRuleIds.has(rule.id)) {
      context.addIssue({
        code: 'custom',
        message: `duplicate key rule id: ${rule.id}`,
        path: ['keyRules', index, 'id'],
      })
    }
    keyRuleIds.add(rule.id)
  }
})

export const InteractionOwnerDefinitionsSchema = z.array(InteractionOwnerDefinitionSchema).superRefine(
  (definitions, context) => {
    const ownerIds = new Set<string>()

    for (const [index, definition] of definitions.entries()) {
      if (ownerIds.has(definition.id)) {
        context.addIssue({
          code: 'custom',
          message: `duplicate owner id: ${definition.id}`,
          path: [index, 'id'],
        })
      }
      ownerIds.add(definition.id)
    }
  },
)

export type InteractionKeyModifier = z.infer<typeof InteractionKeyModifierSchema>
export type InteractionOwnerDefinitionKind = z.infer<typeof InteractionOwnerDefinitionKindSchema>
export type InteractionOwnerScope = z.infer<typeof InteractionOwnerScopeSchema>
export type InteractionFocusStrategy = z.infer<typeof InteractionFocusStrategySchema>
export type InteractionFocusContainment = z.infer<typeof InteractionFocusContainmentSchema>
export type InteractionFocusTarget = z.infer<typeof InteractionFocusTargetSchema>
export type InteractionTargetPolicy = z.infer<typeof InteractionTargetPolicySchema>
export type InteractionActionDescriptor = z.infer<typeof InteractionActionDescriptorSchema>
export type InteractionKeyRuleDefinition = z.infer<typeof InteractionKeyRuleDefinitionSchema>
export type InteractionShellRulesDefinition = z.infer<typeof InteractionShellRulesDefinitionSchema>
export type InteractionOwnerDefinition = z.infer<typeof InteractionOwnerDefinitionSchema>

export interface InteractionDefinitionKeyInput extends InteractionKeyInput {
  context?: Readonly<Record<string, InteractionSerializableValue>>
}

interface InteractionConditionContext {
  definition: InteractionOwnerDefinition
  input: InteractionDefinitionKeyInput
}

export function defineInteractionOwner(input: unknown): InteractionOwnerDefinition {
  return InteractionOwnerDefinitionSchema.parse(input)
}

export function defineInteractionOwners(input: unknown): InteractionOwnerDefinition[] {
  return InteractionOwnerDefinitionsSchema.parse(input)
}

export function compileInteractionOwnerDefinition(input: unknown): InteractionOwner {
  const definition = defineInteractionOwner(input)
  const keyRules = definition.keyRules.map(toRuntimeKeyRule)

  return {
    id: definition.id,
    kind: runtimeKindForDefinition(definition),
    diagnostics: {
      label: definition.diagnostics?.label,
      role: definition.diagnostics?.role,
      focusStrategy: definition.focus?.strategy,
      keyRules,
    },
    ownsKey(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) => {
        if (rule.kind === 'restore') return false
        if (rule.kind === 'shell') return runtimeKindForDefinition(definition) === 'shell'
        return true
      }) !== null
    },
    allowsNativeKey(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) =>
        rule.kind !== 'restore' && ruleAllowsNativeTarget(rule, keyInput, runtimeKindForDefinition(definition)),
      ) !== null
    },
    restoreKeys(keyInput) {
      return findMatchingRule(definition, keyInput, (rule) => rule.kind === 'restore') !== null
    },
    allowsShellKey(keyInput) {
      return shellRulesAllowKey(definition, keyInput)
    },
    restoreTarget: toRuntimeRestoreTarget(definition),
  }
}

export function compileInteractionOwnerDefinitions(input: unknown): InteractionOwner[] {
  return defineInteractionOwners(input).map((definition) => compileInteractionOwnerDefinition(definition))
}

export function evaluateInteractionCondition(
  condition: InteractionCondition,
  definition: InteractionOwnerDefinition,
  input: InteractionDefinitionKeyInput,
): boolean {
  return evaluateCondition(condition, { definition, input })
}

function findMatchingRule(
  definition: InteractionOwnerDefinition,
  input: InteractionKeyInput,
  predicate: (rule: InteractionKeyRuleDefinition) => boolean,
): InteractionKeyRuleDefinition | null {
  for (const rule of definition.keyRules) {
    if (!predicate(rule)) continue
    if (!ruleMatchesInput(rule, definition, input)) continue
    return rule
  }

  return null
}

function ruleMatchesInput(
  rule: InteractionKeyRuleDefinition,
  definition: InteractionOwnerDefinition,
  input: InteractionKeyInput,
): boolean {
  if (!rule.keys.includes(input.key)) return false
  if (rule.targetKinds && !rule.targetKinds.includes(input.targetKind ?? 'unknown')) return false
  if (!modifiersMatch(rule.modifiers, input)) return false
  if (rule.when && !evaluateCondition(rule.when, { definition, input })) return false
  return true
}

function modifiersMatch(modifiers: readonly InteractionKeyModifier[], input: InteractionKeyInput): boolean {
  return modifierRequested(modifiers, 'Alt') === (input.altKey ?? false)
    && modifierRequested(modifiers, 'Control') === (input.ctrlKey ?? false)
    && modifierRequested(modifiers, 'Meta') === (input.metaKey ?? false)
    && modifierRequested(modifiers, 'Shift') === (input.shiftKey ?? false)
}

function modifierRequested(modifiers: readonly InteractionKeyModifier[], modifier: InteractionKeyModifier): boolean {
  return modifiers.includes(modifier)
}

function shellRulesAllowKey(definition: InteractionOwnerDefinition, input: InteractionKeyInput): boolean {
  if (!definition.shellRules?.allowGlobal) return false
  const blockWhen = definition.shellRules.blockWhen
  if (!blockWhen) return true
  return !evaluateCondition(blockWhen, { definition, input })
}

function ruleAllowsNativeTarget(
  rule: InteractionKeyRuleDefinition,
  input: InteractionKeyInput,
  runtimeKind: InteractionOwnerKind,
): boolean {
  const targetKind = input.targetKind ?? 'unknown'
  if (targetKind === 'text-input' || targetKind === 'textarea' || targetKind === 'select' || targetKind === 'contenteditable') {
    return runtimeKind === 'shell'
      ? rule.targetPolicy?.nativeText === 'allow-shell'
      : rule.targetPolicy?.nativeText === 'allow-owner'
  }
  if (targetKind === 'native-control') {
    return runtimeKind === 'shell'
      ? rule.targetPolicy?.nativeControl === 'allow-shell'
      : rule.targetPolicy?.nativeControl === 'allow-owner'
  }
  return false
}

function evaluateCondition(condition: InteractionCondition, context: InteractionConditionContext): boolean {
  switch (condition.type) {
    case 'all':
      return condition.conditions.every((child) => evaluateCondition(child, context))
    case 'any':
      return condition.conditions.some((child) => evaluateCondition(child, context))
    case 'not':
      return !evaluateCondition(condition.condition, context)
    case 'target.kind':
      return matchesOne(context.input.targetKind ?? 'unknown', condition)
    case 'owner.kind':
      return matchesOne(context.definition.kind, condition)
    case 'owner.mode':
      return context.definition.mode !== undefined && matchesOne(context.definition.mode, condition)
    case 'key.value':
      return matchesOne(context.input.key, condition)
    case 'key.modifier':
      return modifierIsPressed(condition.includes, context.input)
    case 'context.value': {
      const value = context.input.context?.[condition.key]
      return value !== undefined && matchesOne(value, condition)
    }
  }
}

function matchesOne<T>(
  value: T,
  condition: { readonly equals?: T; readonly in?: readonly T[] },
): boolean {
  if (condition.equals !== undefined && value === condition.equals) return true
  if (condition.in?.includes(value)) return true
  return false
}

function modifierIsPressed(modifier: InteractionKeyModifier, input: InteractionKeyInput): boolean {
  if (modifier === 'Alt') return input.altKey ?? false
  if (modifier === 'Control') return input.ctrlKey ?? false
  if (modifier === 'Meta') return input.metaKey ?? false
  return input.shiftKey ?? false
}

function toRuntimeKeyRule(rule: InteractionKeyRuleDefinition): InteractionKeyRule {
  const modifiers = rule.modifiers

  return {
    id: rule.id,
    keys: rule.keys,
    kind: rule.kind as InteractionKeyRuleKind,
    label: rule.label ?? rule.description,
    altKey: modifierRequested(modifiers, 'Alt'),
    ctrlKey: modifierRequested(modifiers, 'Control'),
    metaKey: modifierRequested(modifiers, 'Meta'),
    shiftKey: modifierRequested(modifiers, 'Shift'),
    targetKinds: rule.targetKinds as readonly InteractionKeyTargetKind[] | undefined,
  }
}

function runtimeKindForDefinition(definition: InteractionOwnerDefinition): InteractionOwnerKind {
  if (definition.runtimeKind) return definition.runtimeKind
  if (definition.kind === 'shell') return 'shell'
  if (
    definition.kind === 'dialog'
    || definition.kind === 'popover'
    || definition.kind === 'input'
    || definition.kind === 'form'
    || definition.kind === 'editor'
    || definition.kind === 'native-control'
    || definition.kind === 'temporary-control'
  ) {
    return 'temporary-control'
  }
  return 'pattern'
}

function toRuntimeRestoreTarget(definition: InteractionOwnerDefinition): InteractionRestoreTarget | undefined {
  const target = definition.focus?.restore
  if (!target || target.kind === 'none') return undefined

  if (target.kind === 'first' || target.kind === 'selected' || target.kind === 'last-active') {
    return {
      kind: 'active-cursor',
      ownerId: definition.id,
      label: target.label ?? target.kind,
    }
  }

  return {
    kind: target.kind,
    ownerId: definition.id,
    label: target.label,
    ...('elementId' in target ? { elementId: target.elementId } : {}),
  }
}
