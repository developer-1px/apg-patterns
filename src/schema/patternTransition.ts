import { z } from 'zod'
import { JsonValueSchema } from './jsonValue'
import { PatternEventTypeSchema } from './patternEvent'
import { PredicateSchema } from './patternPredicate'

export const StateFieldSchema = z.enum([
  'activeKey', 'anchorKey', 'extentKey', 'selectedKeys', 'expandedKeys', 'disabledKeys',
  'checkedByKey', 'pressedByKey', 'currentByKey', 'invalidByKey', 'requiredKeys',
  'busyKeys', 'modalKeys', 'levelByKey', 'posInSetByKey', 'setSizeByKey',
  'rowIndexByKey', 'columnIndexByKey', 'sortByKey', 'valueByKey', 'rangeValueByKey',
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

export const TransitionValueSchema = z.union([
  z.object({ from: EventValueSourceSchema }).strict(),
  z.object({ literal: JsonValueSchema }).strict(),
])
export type TransitionValue = z.infer<typeof TransitionValueSchema>

export const StateActionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('set'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('add'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('remove'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setMembership'), field: StateFieldSchema, value: TransitionValueSchema, present: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('setRecordValue'), field: StateFieldSchema, key: TransitionValueSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('toggleInSet'), field: StateFieldSchema, value: TransitionValueSchema }).strict(),
  z.object({ kind: z.literal('replaceSet'), field: StateFieldSchema, values: z.array(TransitionValueSchema).readonly() }).strict(),
])
export type StateAction = z.infer<typeof StateActionSchema>

export const TransitionSchema = z
  .object({
    on: PatternEventTypeSchema,
    name: z.string().min(1).optional(),
    when: PredicateSchema.optional(),
    actions: z.array(StateActionSchema).readonly(),
  })
  .strict()
export type Transition = z.infer<typeof TransitionSchema>
