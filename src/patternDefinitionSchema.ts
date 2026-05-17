import { z } from 'zod'
import { JsonValueSchema, type JsonValue, validateJsonExtensionFields } from './jsonValueSchema'
import { KeyTokenSchema } from './patternDataSchema'
import { EventTemplateSchema } from './patternEventSchema'

export type Predicate =
  | { kind: 'always' }
  | { kind: 'hasActiveKey' }
  | { kind: 'hasChildren'; key: string }
  | { kind: 'isExpanded'; key: string }
  | { kind: 'isDisabled'; key: string }
  | { kind: 'optionEquals'; option: string; value: string | boolean }
  | { kind: 'not'; predicate: Predicate }
  | { kind: 'all'; predicates: readonly Predicate[] }
  | { kind: 'any'; predicates: readonly Predicate[] }
  | { kind: 'extension'; name: string; key?: string; args?: Record<string, JsonValue> }

export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('always') }).strict(),
    z.object({ kind: z.literal('hasActiveKey') }).strict(),
    z.object({ kind: z.literal('hasChildren'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isExpanded'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isDisabled'), key: KeyTokenSchema }).strict(),
    z
      .object({
        kind: z.literal('optionEquals'),
        option: z.string().min(1),
        value: z.union([z.string(), z.boolean()]),
      })
      .strict(),
    z.object({ kind: z.literal('not'), predicate: PredicateSchema }).strict(),
    z.object({ kind: z.literal('all'), predicates: z.array(PredicateSchema).readonly() }).strict(),
    z.object({ kind: z.literal('any'), predicates: z.array(PredicateSchema).readonly() }).strict(),
    z
      .object({
        kind: z.literal('extension'),
        name: z.string().min(1),
        key: KeyTokenSchema.optional(),
        args: z.record(z.string(), JsonValueSchema).optional(),
      })
      .strict(),
  ]),
)

export const KeyboardCaseSchema = z.discriminatedUnion('case', [
  z.object({ case: z.literal('when'), when: PredicateSchema, events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('always'), events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('otherwise'), events: z.array(EventTemplateSchema).readonly() }).strict(),
])

export const KeyboardBindingSchema = z.object({ shortcut: z.string().min(1), preventDefault: z.boolean().optional(), cases: z.array(KeyboardCaseSchema).readonly() }).strict()
export type KeyboardBinding = z.infer<typeof KeyboardBindingSchema>

export const AriaSourceSchema = z.string().min(1)
export const AriaProjectionSchema = z.object({ attribute: z.string().min(1), from: AriaSourceSchema, when: PredicateSchema.optional() }).strict()
export type AriaProjection = z.infer<typeof AriaProjectionSchema>

export const StateProjectionSchema = z.object({ name: z.string().min(1), from: z.string().min(1) }).strict()
export type StateProjection = z.infer<typeof StateProjectionSchema>

export const FocusProjectionSchema = z.object({ tabIndex: z.object({ when: PredicateSchema, active: z.number().optional(), inactive: z.number().optional(), value: z.number().optional() }).strict() }).strict()
export type FocusProjection = z.infer<typeof FocusProjectionSchema>

export const PartEventBindingSchema = z.object({ event: z.string().min(1), when: PredicateSchema.optional(), events: z.array(EventTemplateSchema).readonly() }).strict()
export type PartEventBinding = z.infer<typeof PartEventBindingSchema>

export const PartSchema = z
  .object({
    role: z.string().min(1),
    keySource: z.string().min(1).optional(),
    aria: z.array(AriaProjectionSchema).readonly().optional(),
    focus: FocusProjectionSchema.optional(),
    state: z.array(StateProjectionSchema).readonly().optional(),
    events: z.array(PartEventBindingSchema).readonly().optional(),
  })
  .strict()

const NavigationTargetSchema = z
  .object({ kind: z.string().min(1) })
  .passthrough()
  .superRefine((value, ctx) => validateJsonExtensionFields(value, ['kind'], ctx))

const VisibleOrderSchema = z
  .object({ kind: z.string().min(1) })
  .passthrough()
  .superRefine((value, ctx) => validateJsonExtensionFields(value, ['kind'], ctx))

export const NavigationSchema = z
  .object({
    visibleOrder: VisibleOrderSchema,
    targets: z.record(z.string().min(1), NavigationTargetSchema),
  })
  .strict()

export const PatternDefinitionSchema = z
  .object({
    apgPattern: z.string().min(1),
    rootRole: z.string().min(1),
    containedRoles: z.array(z.string().min(1)).readonly().optional(),
    focusModel: z.string().min(1).optional(),
    parts: z.record(z.string().min(1), PartSchema),
    navigation: NavigationSchema,
    keyboard: z.array(KeyboardBindingSchema).readonly(),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    validateJsonExtensionFields(value, ['apgPattern', 'rootRole', 'containedRoles', 'focusModel', 'parts', 'navigation', 'keyboard'], ctx)
    const rootParts = Object.entries(value.parts).filter(([, part]) => part.role === value.rootRole)
    if (rootParts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['parts'],
        message: `no part with role="${value.rootRole}" — definition must contain exactly one root part whose role matches rootRole.`,
      })
    } else if (rootParts.length > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['parts'],
        message: `multiple parts (${rootParts.map(([n]) => `"${n}"`).join(', ')}) share rootRole="${value.rootRole}" — exactly one allowed.`,
      })
    }
  })

export type PatternDefinition = z.infer<typeof PatternDefinitionSchema>
