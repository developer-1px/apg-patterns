import { z } from 'zod'
import { KeyTokenSchema } from './keys'
import { PatternEventReasonSchema, type PatternEventReason } from './patternEvent'
import { PredicateSchema, type Predicate } from './patternPredicate'

type KeyToken = string

type DirectElementTarget =
  | { kind: 'key'; key: KeyToken }
  | { kind: 'controlledBy'; key: KeyToken }
  | { kind: 'firstFocusable'; root: { kind: 'controlledBy'; key: KeyToken } }

export type ElementTarget =
  | DirectElementTarget
  | { kind: 'firstAvailable'; targets: readonly DirectElementTarget[] }

interface FocusEffectTrigger {
  state: 'activeKey'
  reasons: readonly PatternEventReason[]
}

type FocusEffectScope = { kind: 'focusWithin' } | { kind: 'always' }
type FocusEffectTarget = { kind: 'activeKeyElement' } | ElementTarget

export type EffectDefinition =
  | {
      kind: 'focus'
      when?: Predicate
      on?: FocusEffectTrigger
      scope?: FocusEffectScope
      target: FocusEffectTarget
      preventScroll?: boolean
    }
  | { kind: 'restoreFocus'; when: Predicate; target: ElementTarget; preventScroll?: boolean }
  | { kind: 'trapFocus'; when: Predicate; root: ElementTarget }

const KeyElementTargetSchema = z.object({ kind: z.literal('key'), key: KeyTokenSchema }).strict()
const ControlledByElementTargetSchema = z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict()
const FirstFocusableElementTargetSchema = z.object({ kind: z.literal('firstFocusable'), root: z.object({ kind: z.literal('controlledBy'), key: KeyTokenSchema }).strict() }).strict()

const DirectElementTargetUnionSchema = z.discriminatedUnion('kind', [
  KeyElementTargetSchema,
  ControlledByElementTargetSchema,
  FirstFocusableElementTargetSchema,
])

const ElementTargetUnionSchema = z.discriminatedUnion('kind', [
  ...DirectElementTargetUnionSchema.options,
  z.object({ kind: z.literal('firstAvailable'), targets: z.array(DirectElementTargetUnionSchema).min(1).readonly() }).strict(),
])

export const ElementTargetSchema: z.ZodType<ElementTarget> = ElementTargetUnionSchema

export const FocusEffectTriggerSchema: z.ZodType<FocusEffectTrigger> = z.object({
  state: z.literal('activeKey'),
  reasons: z.array(PatternEventReasonSchema).readonly(),
}).strict()

export const FocusEffectScopeSchema: z.ZodType<FocusEffectScope> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('focusWithin') }).strict(),
  z.object({ kind: z.literal('always') }).strict(),
])

export const FocusEffectTargetSchema: z.ZodType<FocusEffectTarget> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('activeKeyElement') }).strict(),
  ...ElementTargetUnionSchema.options,
])

export const EffectSchema: z.ZodType<EffectDefinition> = z.discriminatedUnion('kind', [
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
