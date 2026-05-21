import { z } from 'zod'
import { KeySchema, type Key } from './patternData'

export const PatternDirectionSchema = z.enum([
  'child', 'down', 'first', 'gridEnd', 'gridStart', 'last', 'left', 'next',
  'pageDown', 'pageUp', 'parent', 'parentRow', 'previous', 'right',
  'rowEnd', 'rowStart', 'up',
  'rowUp', 'rowDown', 'rowGridStart', 'rowGridEnd', 'rowPageDown', 'rowPageUp',
])
export type PatternDirection = z.infer<typeof PatternDirectionSchema>

export const PatternValueStepDirectionSchema = z.enum([
  'increment', 'decrement', 'incrementLarge', 'decrementLarge', 'min', 'max',
])
export type PatternValueStepDirection = z.infer<typeof PatternValueStepDirectionSchema>

export const PatternEventTypeSchema = z.enum([
  'focus', 'navigate', 'select', 'selectAll', 'selectColumn', 'selectRow',
  'extendSelection', 'expand', 'expandActiveRow', 'activate', 'check',
  'press', 'value', 'valueStep', 'collapse', 'close', 'inputValue', 'commitValue',
  'typeahead', 'dismiss', 'sort', 'editStart', 'editDraft', 'editEnd', 'reorder', 'remove',
])
export type PatternEventType = z.infer<typeof PatternEventTypeSchema>

export const PatternEventReasonSchema = z.enum(['keyboard', 'typeahead', 'pointer', 'focus', 'external', 'open'])
export type PatternEventReason = z.infer<typeof PatternEventReasonSchema>

interface PatternEventMeta {
  reason?: PatternEventReason
}

type EventWithMeta = { meta?: PatternEventMeta }
type EventValue = string | number | boolean | null
type ToggleState = boolean | 'mixed'

export type PatternEvent =
  | ({ type: 'focus'; key: Key } & EventWithMeta)
  | ({ type: 'navigate'; direction: PatternDirection } & EventWithMeta)
  | ({ type: 'select'; keys: readonly Key[]; anchorKey?: Key | null; extentKey?: Key | null } & EventWithMeta)
  | ({ type: 'selectAll' } & EventWithMeta)
  | ({ type: 'selectColumn' } & EventWithMeta)
  | ({ type: 'selectRow' } & EventWithMeta)
  | ({ type: 'extendSelection'; direction: PatternDirection } & EventWithMeta)
  | ({ type: 'expand'; key: Key; expanded: boolean } & EventWithMeta)
  | ({ type: 'expandActiveRow'; expanded: boolean } & EventWithMeta)
  | ({ type: 'activate'; key: Key } & EventWithMeta)
  | ({ type: 'check'; key: Key; checked: ToggleState } & EventWithMeta)
  | ({ type: 'press'; key: Key; pressed?: ToggleState } & EventWithMeta)
  | ({ type: 'value'; key: Key; value: EventValue } & EventWithMeta)
  | ({ type: 'valueStep'; key: Key; direction: PatternValueStepDirection } & EventWithMeta)
  | ({ type: 'collapse'; key: Key } & EventWithMeta)
  | ({ type: 'close'; key: Key } & EventWithMeta)
  | ({ type: 'inputValue'; key?: Key; value: string; inline?: boolean } & EventWithMeta)
  | ({ type: 'commitValue'; key?: Key; value: string } & EventWithMeta)
  | ({ type: 'typeahead'; query: string } & EventWithMeta)
  | ({ type: 'dismiss'; key?: Key } & EventWithMeta)
  | ({ type: 'sort'; key: Key; sort: 'ascending' | 'descending' | 'other' } & EventWithMeta)
  | ({ type: 'editStart'; key: Key; value?: EventValue } & EventWithMeta)
  | ({ type: 'editDraft'; key: Key; value: EventValue } & EventWithMeta)
  | ({ type: 'editEnd'; key?: Key } & EventWithMeta)
  | ({ type: 'reorder'; key?: Key; keys: readonly Key[] } & EventWithMeta)
  | ({ type: 'remove'; key?: Key; keys?: readonly Key[]; activeKey?: Key | null; selectedKeys?: readonly Key[] } & EventWithMeta)

export const PatternEventMetaSchema: z.ZodType<PatternEventMeta> = z.object({ reason: PatternEventReasonSchema.optional() }).strict()
const EventMetaFieldSchema = { meta: PatternEventMetaSchema.optional() }

export const PatternEventSchema: z.ZodType<PatternEvent> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeySchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('select'), keys: z.array(KeySchema).readonly(), anchorKey: KeySchema.nullish(), extentKey: KeySchema.nullish(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectAll'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectColumn'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectRow'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('extendSelection'), direction: PatternDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('expand'), key: KeySchema, expanded: z.boolean(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('expandActiveRow'), expanded: z.boolean(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('activate'), key: KeySchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('check'), key: KeySchema, checked: z.union([z.boolean(), z.literal('mixed')]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('press'), key: KeySchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('value'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('valueStep'), key: KeySchema, direction: PatternValueStepDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('collapse'), key: KeySchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('close'), key: KeySchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('inputValue'), key: KeySchema.optional(), value: z.string(), inline: z.boolean().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('commitValue'), key: KeySchema.optional(), value: z.string(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeySchema.optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('sort'), key: KeySchema, sort: z.enum(['ascending', 'descending', 'other']), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editStart'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editDraft'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editEnd'), key: KeySchema.optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('reorder'), key: KeySchema.optional(), keys: z.array(KeySchema).readonly(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('remove'), key: KeySchema.optional(), keys: z.array(KeySchema).readonly().optional(), activeKey: KeySchema.nullish(), selectedKeys: z.array(KeySchema).readonly().optional(), ...EventMetaFieldSchema }).strict(),
])
