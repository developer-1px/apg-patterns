import { z } from 'zod'
import { KeyTokenSchema } from './keys'
import { PatternEventReasonSchema } from './patternEvent'
import { PredicateSchema } from './patternPredicate'

export const ElementTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('key'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('firstFocusable'), root: z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict() }).strict(),
])
export type ElementTarget = z.infer<typeof ElementTargetSchema>

export const FocusEffectTriggerSchema = z.object({
  state: z.literal('activeKey'),
  reasons: z.array(PatternEventReasonSchema).readonly(),
}).strict()

export const FocusEffectScopeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('focusWithin') }).strict(),
  z.object({ kind: z.literal('always') }).strict(),
])

export const FocusEffectTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('activeKeyElement') }).strict(),
  ...ElementTargetSchema.options,
])

export const EffectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('focus'),
    when: PredicateSchema.optional(),
    on: FocusEffectTriggerSchema.optional(),
    scope: FocusEffectScopeSchema.optional(),
    target: FocusEffectTargetSchema,
    preventScroll: z.boolean().optional(),
  }).strict(),
  z.object({ kind: z.literal('restoreFocus'), when: PredicateSchema, target: ElementTargetSchema, preventScroll: z.boolean().optional() }).strict(),
  z.object({ kind: z.literal('trapFocus'), when: PredicateSchema, root: ElementTargetSchema }).strict(),
])
export type EffectDefinition = z.infer<typeof EffectSchema>
