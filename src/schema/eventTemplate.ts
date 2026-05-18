import { z } from 'zod'
import { KeySchema, KeyTokenSchema } from './patternData'
import { PatternDirectionSchema, PatternEventMetaSchema, PatternValueStepDirectionSchema } from './patternEvent'

const EventMetaFieldSchema = { meta: PatternEventMetaSchema.optional() }

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
