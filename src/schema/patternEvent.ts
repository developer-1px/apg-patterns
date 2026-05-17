import { z } from 'zod'
import { JsonValueSchema } from './jsonValue'
import { KeySchema, KeyTokenSchema } from './patternData'

export const PatternDirectionSchema = z.enum([
  'child', 'down', 'first', 'gridEnd', 'gridStart', 'last', 'left', 'next',
  'pageDown', 'pageUp', 'parent', 'parentRow', 'previous', 'right',
  'rowEnd', 'rowStart', 'up',
])
export type PatternDirection = z.infer<typeof PatternDirectionSchema>

export const PatternEventTypeSchema = z.enum([
  'focus', 'navigate', 'select', 'expand', 'activate', 'open', 'check',
  'press', 'value', 'typeahead', 'dismiss', 'extension',
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
  z.object({ type: z.literal('expand'), key: KeySchema, expanded: z.boolean(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('activate'), key: KeySchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('open'), key: KeySchema, open: z.boolean(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('check'), key: KeySchema, checked: z.union([z.boolean(), z.literal('mixed')]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('press'), key: KeySchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('value'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeySchema.optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('extension'), name: z.string().min(1), key: KeySchema.optional(), payload: z.record(z.string(), JsonValueSchema).optional(), ...EventMetaFieldSchema }).strict(),
])

export type PatternEvent = z.infer<typeof PatternEventSchema>

export const EventTemplateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('select'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('expand'), key: KeyTokenSchema, expanded: z.boolean().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('activate'), key: KeyTokenSchema, ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('open'), key: KeyTokenSchema, open: z.boolean().optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('check'), key: KeyTokenSchema, checked: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('press'), key: KeyTokenSchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('value'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string(), ...EventMetaFieldSchema }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeyTokenSchema.optional(), ...EventMetaFieldSchema }).strict(),
  z
    .object({
      type: z.literal('extension'),
      name: z.string().min(1),
      key: KeyTokenSchema.optional(),
      payload: z.record(z.string(), JsonValueSchema).optional(),
      ...EventMetaFieldSchema,
    })
    .strict(),
])
export type EventTemplate = z.infer<typeof EventTemplateSchema>
