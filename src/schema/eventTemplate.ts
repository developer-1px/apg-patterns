import { z } from 'zod'
import { KeySchema, KeyTokenSchema, type Key } from './patternData'
import {
  PatternDirectionSchema,
  PatternEventMetaSchema,
  PatternValueStepDirectionSchema,
  type PatternDirection,
  type PatternEventReason,
  type PatternValueStepDirection,
} from './patternEvent'

type EventTemplateMeta = { reason?: PatternEventReason }
type EventTemplateValue = string | number | boolean | null
type KeyToken = string
type TemplateWithMeta = { meta?: EventTemplateMeta }

const EventMetaFieldSchema = { meta: PatternEventMetaSchema.optional() }

export type EventTemplate =
  | ({ type: 'focus'; key: KeyToken } & TemplateWithMeta)
  | ({ type: 'navigate'; direction: PatternDirection } & TemplateWithMeta)
  | ({ type: 'select'; key: KeyToken } & TemplateWithMeta)
  | ({ type: 'selectAll' } & TemplateWithMeta)
  | ({ type: 'selectColumn' } & TemplateWithMeta)
  | ({ type: 'selectRow' } & TemplateWithMeta)
  | ({ type: 'extendSelection'; direction: PatternDirection } & TemplateWithMeta)
  | ({ type: 'expand'; key: KeyToken; expanded?: boolean } & TemplateWithMeta)
  | ({ type: 'expandActiveRow'; expanded: boolean } & TemplateWithMeta)
  | ({ type: 'activate'; key: KeyToken } & TemplateWithMeta)
  | ({ type: 'check'; key: KeyToken; checked?: boolean | 'mixed' } & TemplateWithMeta)
  | ({ type: 'press'; key: KeyToken; pressed?: boolean | 'mixed' } & TemplateWithMeta)
  | ({ type: 'value'; key: KeyToken; value: EventTemplateValue } & TemplateWithMeta)
  | ({ type: 'valueStep'; key: KeyToken; direction: PatternValueStepDirection } & TemplateWithMeta)
  | ({ type: 'collapse'; key: KeyToken } & TemplateWithMeta)
  | ({ type: 'close'; key: KeyToken } & TemplateWithMeta)
  | ({ type: 'inputValue'; key?: KeyToken; value?: string; inline?: boolean } & TemplateWithMeta)
  | ({ type: 'commitValue'; key?: KeyToken; value?: string } & TemplateWithMeta)
  | ({ type: 'typeahead'; query: string } & TemplateWithMeta)
  | ({ type: 'dismiss'; key?: KeyToken } & TemplateWithMeta)
  | ({ type: 'sort'; key: KeyToken; sort: 'ascending' | 'descending' | 'other' } & TemplateWithMeta)
  | ({ type: 'editStart'; key: KeyToken; value?: EventTemplateValue } & TemplateWithMeta)
  | ({ type: 'editDraft'; key: KeyToken; value: EventTemplateValue } & TemplateWithMeta)
  | ({ type: 'editEnd'; key?: KeyToken } & TemplateWithMeta)
  | ({ type: 'reorder'; key?: KeyToken; keys: readonly Key[] } & TemplateWithMeta)
  | ({ type: 'remove'; key?: KeyToken; keys?: readonly Key[]; activeKey?: Key | null; selectedKeys?: readonly Key[] } & TemplateWithMeta)

export const EventTemplateSchema: z.ZodType<EventTemplate> = z.discriminatedUnion('type', [
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
