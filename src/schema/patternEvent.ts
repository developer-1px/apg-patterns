import { z } from 'zod'
import { KeySchema, KeyTokenSchema } from './patternData'

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

export const PatternEventMetaSchema = z.object({ reason: PatternEventReasonSchema.optional() }).strict()
const EventMetaFieldSchema = { meta: PatternEventMetaSchema.optional() }

export const PatternEventSchema = z.discriminatedUnion('type', [
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

export type PatternEvent = z.infer<typeof PatternEventSchema>

export const EventTemplateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('select'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectAll'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectColumn'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('selectRow'), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('extendSelection'), direction: PatternDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('expand'), key: KeyTokenSchema, expanded: z.boolean().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('expandActiveRow'), expanded: z.boolean(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('activate'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('check'), key: KeyTokenSchema, checked: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('press'), key: KeyTokenSchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('value'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('valueStep'), key: KeyTokenSchema, direction: PatternValueStepDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('collapse'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('close'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('inputValue'), key: KeyTokenSchema.optional(), value: z.string().optional(), inline: z.boolean().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('commitValue'), key: KeyTokenSchema.optional(), value: z.string().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeyTokenSchema.optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('sort'), key: KeyTokenSchema, sort: z.enum(['ascending', 'descending', 'other']), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editStart'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editDraft'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('editEnd'), key: KeyTokenSchema.optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('reorder'), key: KeyTokenSchema.optional(), keys: z.array(KeySchema).readonly(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('remove'), key: KeyTokenSchema.optional(), keys: z.array(KeySchema).readonly().optional(), activeKey: KeySchema.nullish(), selectedKeys: z.array(KeySchema).readonly().optional(), ...EventMetaFieldSchema }).strict(),
])
export type EventTemplate = z.infer<typeof EventTemplateSchema>
