import { z } from 'zod'
import { KeySchema, KeyTokenSchema } from './patternDataSchema'

export const PatternDirectionSchema = z.string().min(1)
export type PatternDirection = z.infer<typeof PatternDirectionSchema>

export const PatternEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeySchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema }).strict(),
  z.object({ type: z.literal('select'), keys: z.array(KeySchema).readonly(), anchorKey: KeySchema.nullish(), extentKey: KeySchema.nullish() }).strict(),
  z.object({ type: z.literal('expand'), key: KeySchema, expanded: z.boolean() }).strict(),
  z.object({ type: z.literal('activate'), key: KeySchema }).strict(),
  z.object({ type: z.literal('open'), key: KeySchema, open: z.boolean() }).strict(),
  z.object({ type: z.literal('check'), key: KeySchema, checked: z.union([z.boolean(), z.literal('mixed')]) }).strict(),
  z.object({ type: z.literal('press'), key: KeySchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('value'), key: KeySchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string() }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeySchema.optional() }).strict(),
  z.object({ type: z.literal('extension'), name: z.string().min(1), key: KeySchema.optional(), payload: z.record(z.string(), z.unknown()).optional() }).strict(),
])

export type PatternEvent = z.infer<typeof PatternEventSchema>

export const EventTemplateSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('focus'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('navigate'), direction: PatternDirectionSchema }).strict(),
  z.object({ type: z.literal('select'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('expand'), key: KeyTokenSchema, expanded: z.boolean().optional() }).strict(),
  z.object({ type: z.literal('activate'), key: KeyTokenSchema }).strict(),
  z.object({ type: z.literal('open'), key: KeyTokenSchema, open: z.boolean().optional() }).strict(),
  z.object({ type: z.literal('check'), key: KeyTokenSchema, checked: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('press'), key: KeyTokenSchema, pressed: z.union([z.boolean(), z.literal('mixed')]).optional() }).strict(),
  z.object({ type: z.literal('value'), key: KeyTokenSchema, value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ type: z.literal('typeahead'), query: z.string() }).strict(),
  z.object({ type: z.literal('dismiss'), key: KeyTokenSchema.optional() }).strict(),
  z
    .object({
      type: z.literal('extension'),
      name: z.string().min(1),
      key: KeyTokenSchema.optional(),
      payload: z.record(z.string(), z.unknown()).optional(),
    })
    .strict(),
])
export type EventTemplate = z.infer<typeof EventTemplateSchema>
