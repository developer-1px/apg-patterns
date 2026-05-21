import { z } from 'zod'
import { ReactItemPropSchema, ReactPropNameSchema } from './reactPropSchema'

export const ReactItemFieldNameSchema = z.enum([
  'key',
  'kind',
  'label',
  'textValue',
  'level',
  'parentKey',
  'indexInParent',
  'panelKey',
  'state',
])

export const ReactRenderSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('visibleOrder') }).strict(),
])

export const ReactRenderValueSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('literal'), value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ kind: z.literal('key') }).strict(),
  z.object({ kind: z.literal('itemField'), field: z.string().min(1), fallback: z.enum(['key']).optional() }).strict(),
  z.object({ kind: z.literal('textValue'), fallback: z.enum(['label', 'key']) }).strict(),
  z.object({ kind: z.literal('partState'), part: z.string().min(1) }).strict(),
  z.object({ kind: z.literal('treeKind'), branch: z.literal('branch'), leaf: z.literal('leaf') }).strict(),
  z.object({ kind: z.literal('treeLevel'), base: z.literal(1) }).strict(),
  z.object({ kind: z.literal('treeParentKey'), rootValue: z.literal(null) }).strict(),
  z.object({ kind: z.literal('treeIndexInParent'), base: z.literal(1) }).strict(),
  z.object({ kind: z.literal('firstControlledKey'), fallback: z.literal(null) }).strict(),
])

type ReactRenderVariantWhen =
  | { kind: 'always' }
  | { kind: 'hasChildren'; key: '$key' }
  | { kind: 'not'; predicate: { kind: 'hasChildren'; key: '$key' } }

export const ReactRenderVariantWhenSchema: z.ZodType<ReactRenderVariantWhen> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('always') }).strict(),
  z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict(),
  z.object({ kind: z.literal('not'), predicate: z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict() }).strict(),
])

export const ReactRenderVariantSchema = z
  .object({
    kind: z.string().min(1),
    when: ReactRenderVariantWhenSchema,
    fields: z.partialRecord(ReactItemFieldNameSchema, ReactRenderValueSchema),
    props: z.record(ReactPropNameSchema, ReactItemPropSchema),
  })
  .strict()

export const ReactRenderItemsSchema = z
  .object({
    name: z.literal('renderItems'),
    source: ReactRenderSourceSchema,
    order: z.enum(['flat', 'treePreorderVisible']).optional(),
    variants: z.array(ReactRenderVariantSchema).min(1).readonly(),
  })
  .strict()
