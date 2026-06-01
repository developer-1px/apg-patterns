import { z } from 'zod'

import {
  compileInteractionOwnerUnchecked,
  compileInteractionOwnersUnchecked,
} from './interactionDefinitionCompile'
import type {
  InteractionCondition,
  InteractionOwnerDefinition,
} from './interactionDefinitionTypes'
import type {
  InteractionOwner,
  InteractionSerializableValue,
} from './interactionOwnership'

export { evaluateInteractionCondition } from './interactionDefinitionCompile'

export type {
  InteractionActionDescriptor,
  InteractionCondition,
  InteractionDefinitionKeyInput,
  InteractionFocusContainment,
  InteractionFocusDefinition,
  InteractionFocusGuardPolicy,
  InteractionFocusStrategy,
  InteractionFocusTarget,
  InteractionKeyModifier,
  InteractionKeyPlatformBinding,
  InteractionKeyRuleDefinition,
  InteractionOwnerDefinition,
  InteractionOwnerDefinitionKind,
  InteractionOwnerDiagnosticsDefinition,
  InteractionOwnerRuntimeKind,
  InteractionOwnerScope,
  InteractionShellRulesDefinition,
  InteractionTargetPolicy,
} from './interactionDefinitionTypes'

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

export const InteractionPlatformSchema = z.enum(['mac', 'windows', 'linux'])

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
  code: z.array(z.string().min(1)).min(1).optional(),
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

export function defineInteractionOwner(input: unknown): InteractionOwnerDefinition {
  return InteractionOwnerDefinitionSchema.parse(input)
}

export function defineInteractionOwners(input: unknown): InteractionOwnerDefinition[] {
  return InteractionOwnerDefinitionsSchema.parse(input)
}

export function compileInteractionOwnerDefinition(input: unknown): InteractionOwner {
  return compileInteractionOwnerUnchecked(defineInteractionOwner(input))
}

export function compileInteractionOwnerDefinitions(input: unknown): InteractionOwner[] {
  return compileInteractionOwnersUnchecked(defineInteractionOwners(input))
}
