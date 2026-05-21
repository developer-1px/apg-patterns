import { z } from 'zod'
import { EventTemplateSchema, type EventTemplate } from './eventTemplate'
import { EffectSchema, type EffectDefinition } from './patternEffects'
import { NavigationSchema } from './patternNavigation'
import { PredicateSchema, type Predicate } from './patternPredicate'
import { TransitionSchema, type Transition } from './patternTransition'
import {
  AriaAttributeSchema,
  AriaRoleSchema,
  AriaSourcePathSchema,
  DomEventNameSchema,
  FocusModelSchema,
  type AriaAttribute,
  type AriaRole,
  type AriaSourcePath,
  type DomEventName,
  type FocusModel,
} from './patternDefinitionVocabulary'
import { validatePatternDefinition } from './patternDefinitionValidation'
import { ReactFacadeSchema, type ReactFacade } from './reactFacade'
export * from './patternDefinitionVocabulary'
export * from './patternEffects'
export * from './patternNavigation'
export * from './patternPredicate'
export * from './patternTransition'

type KeyboardCase =
  | { case: 'when'; when: Predicate; events: readonly EventTemplate[] }
  | { case: 'always'; events: readonly EventTemplate[] }
  | { case: 'otherwise'; events: readonly EventTemplate[] }

export interface KeyboardBinding {
  shortcut: string
  preventDefault?: boolean
  cases: readonly KeyboardCase[]
}

export interface AriaProjection {
  attribute: AriaAttribute
  from: AriaSourcePath
  when?: Predicate
}

export interface StateProjection {
  name: string
  from: AriaSourcePath
}

export interface FocusProjection {
  tabIndex: {
    when: Predicate
    active?: number
    inactive?: number
    value?: number
  }
}

export interface PartEventBinding {
  event: DomEventName
  when?: Predicate
  events: readonly EventTemplate[]
}

interface Part {
  role: AriaRole
  aria?: readonly AriaProjection[]
  focus?: FocusProjection
  state?: readonly StateProjection[]
  events?: readonly PartEventBinding[]
}

export interface PatternDefinition {
  apgPattern: string
  rootRole: AriaRole
  containedRoles?: readonly AriaRole[]
  focusModel?: FocusModel
  parts: Record<string, Part>
  navigation: z.infer<typeof NavigationSchema>
  keyboard: readonly KeyboardBinding[]
  transitions?: readonly Transition[]
  effects?: readonly EffectDefinition[]
  react?: ReactFacade
}

export const KeyboardCaseSchema: z.ZodType<KeyboardCase> = z.discriminatedUnion('case', [
  z.object({ case: z.literal('when'), when: PredicateSchema, events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('always'), events: z.array(EventTemplateSchema).readonly() }).strict(),
  z.object({ case: z.literal('otherwise'), events: z.array(EventTemplateSchema).readonly() }).strict(),
])

export const KeyboardBindingSchema: z.ZodType<KeyboardBinding> = z.object({ shortcut: z.string().min(1), preventDefault: z.boolean().optional(), cases: z.array(KeyboardCaseSchema).readonly() }).strict()

export const AriaProjectionSchema: z.ZodType<AriaProjection> = z.object({ attribute: AriaAttributeSchema, from: AriaSourcePathSchema, when: PredicateSchema.optional() }).strict()

export const StateProjectionSchema: z.ZodType<StateProjection> = z.object({ name: z.string().min(1), from: AriaSourcePathSchema }).strict()

export const FocusProjectionSchema: z.ZodType<FocusProjection> = z.object({ tabIndex: z.object({ when: PredicateSchema, active: z.number().optional(), inactive: z.number().optional(), value: z.number().optional() }).strict() }).strict()

export const PartEventBindingSchema: z.ZodType<PartEventBinding> = z.object({ event: DomEventNameSchema, when: PredicateSchema.optional(), events: z.array(EventTemplateSchema).readonly() }).strict()

export const PartSchema: z.ZodType<Part> = z
  .object({
    role: AriaRoleSchema,
    aria: z.array(AriaProjectionSchema).readonly().optional(),
    focus: FocusProjectionSchema.optional(),
    state: z.array(StateProjectionSchema).readonly().optional(),
    events: z.array(PartEventBindingSchema).readonly().optional(),
  })
  .strict()

export const PatternDefinitionSchema: z.ZodType<PatternDefinition> = z
  .object({
    apgPattern: z.string().min(1),
    rootRole: AriaRoleSchema,
    containedRoles: z.array(AriaRoleSchema).readonly().optional(),
    focusModel: FocusModelSchema.optional(),
    parts: z.record(z.string().min(1), PartSchema),
    navigation: NavigationSchema,
    keyboard: z.array(KeyboardBindingSchema).readonly(),
    transitions: z.array(TransitionSchema).readonly().optional(),
    effects: z.array(EffectSchema).readonly().optional(),
    react: ReactFacadeSchema.optional(),
  })
  .strict()
  .superRefine(validatePatternDefinition)
