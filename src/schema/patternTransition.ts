import { z } from 'zod'
import { JsonValueSchema, type JsonValue } from './jsonValue'
import { PatternEventTypeSchema, type PatternEventType } from './patternEvent'
import { PredicateSchema, type Predicate } from './patternPredicate'

export const StateFieldSchema = z.enum([
  'activeKey', 'anchorKey', 'extentKey', 'selectedKeys', 'expandedKeys', 'disabledKeys',
  'checkedByKey', 'pressedByKey', 'currentByKey', 'invalidByKey', 'requiredKeys',
  'busyKeys', 'modalKeys', 'levelByKey', 'posInSetByKey', 'setSizeByKey',
  'rowIndexByKey', 'columnIndexByKey', 'rowSpanByKey', 'colSpanByKey',
  'sortByKey', 'valueByKey', 'rangeValueByKey',
  'typeaheadTextByKey', 'rowCount', 'colCount',
  'editingKey', 'editDraftByKey',
])
export type StateField = z.infer<typeof StateFieldSchema>

export const EventValueSourceSchema = z.enum([
  '$event.key',
  '$event.keys',
  '$event.anchorKey',
  '$event.extentKey',
  '$event.expanded',
  '$event.checked',
  '$event.pressed',
  '$event.value',
  '$activeKey',
])
export type EventValueSource = z.infer<typeof EventValueSourceSchema>

export type TransitionValue = { from: EventValueSource } | { literal: JsonValue }

export type StateAction =
  | { kind: 'set'; field: StateField; value: TransitionValue }
  | { kind: 'add'; field: StateField; value: TransitionValue }
  | { kind: 'remove'; field: StateField; value: TransitionValue }
  | { kind: 'setMembership'; field: StateField; value: TransitionValue; present: TransitionValue }
  | { kind: 'setRecordValue'; field: StateField; key: TransitionValue; value: TransitionValue }
  | { kind: 'toggleInSet'; field: StateField; value: TransitionValue }
  | { kind: 'replaceSet'; field: StateField; values: readonly TransitionValue[] }

export interface Transition {
  on: PatternEventType
  name?: string
  when?: Predicate
  actions: readonly StateAction[]
}

export const TransitionValueSchema: z.ZodType<TransitionValue> = z.union([
  z.object({ from: EventValueSourceSchema }).strict(),
  z.object({ literal: JsonValueSchema }).strict(),
])

export const StateActionSchema: z.ZodType<StateAction> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('set'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('add'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('remove'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setMembership'), field: StateFieldSchema, value: TransitionValueSchema, present: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setRecordValue'), field: StateFieldSchema, key: TransitionValueSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('toggleInSet'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('replaceSet'), field: StateFieldSchema, values: z.array(TransitionValueSchema).readonly() }).strict(),
])

export const TransitionSchema: z.ZodType<Transition> = z
  .object({
    on: PatternEventTypeSchema,
    name: z.string().min(1).optional(),
    when: PredicateSchema.optional(),
    actions: z.array(StateActionSchema).readonly(),
  })
  .strict()
