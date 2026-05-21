import { z } from 'zod'

const ReactHookNameSchema = z.string().regex(/^use[A-Z][A-Za-z0-9]*Pattern$/)

const ReactPropNameSchema = z.string().regex(/^[a-z][A-Za-z0-9]*Props$/)

const ReactElementNameSchema = z.enum([
  'a',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'input',
  'li',
  'ol',
  'span',
  'ul',
])

const ReactSemanticDefaultPropSchema = z.enum([
  'aria-label',
  'aria-hidden',
  'disabled',
  'tabIndex',
  'href',
  'rel',
  'target',
  'type',
])

const ReactSemanticDefaultsSchema = z.partialRecord(
  ReactSemanticDefaultPropSchema,
  z.union([z.string(), z.number(), z.boolean()]),
)

const ReactPropOwnerSchema = z.enum(['root', 'item', 'toggle', 'panel'])

const ReactItemPropSchema = z
  .object({
    part: z.string().min(1),
    element: ReactElementNameSchema,
    owner: ReactPropOwnerSchema,
    whenKind: z.string().min(1).optional(),
    defaults: ReactSemanticDefaultsSchema.optional(),
    stopsPropagation: z.boolean().optional(),
  })
  .strict()

const ReactItemFieldNameSchema = z.enum([
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

const ReactRenderSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('visibleOrder') }).strict(),
])

const ReactRenderValueSchema = z.discriminatedUnion('kind', [
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

const ReactRenderVariantWhenSchema: z.ZodType<ReactRenderVariantWhen> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('always') }).strict(),
  z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict(),
  z.object({ kind: z.literal('not'), predicate: z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict() }).strict(),
])

const ReactRenderVariantSchema = z
  .object({
    kind: z.string().min(1),
    when: ReactRenderVariantWhenSchema,
    fields: z.partialRecord(ReactItemFieldNameSchema, ReactRenderValueSchema),
    props: z.record(ReactPropNameSchema, ReactItemPropSchema),
  })
  .strict()

const ReactRenderItemsSchema = z
  .object({
    name: z.literal('renderItems'),
    source: ReactRenderSourceSchema,
    order: z.enum(['flat', 'treePreorderVisible']).optional(),
    variants: z.array(ReactRenderVariantSchema).min(1).readonly(),
  })
  .strict()

export const ReactFacadeSchema = z
  .object({
    hook: ReactHookNameSchema,
    root: z
      .object({
        prop: z.literal('rootProps'),
        part: z.string().min(1),
        element: ReactElementNameSchema,
      })
      .strict(),
    renderItems: ReactRenderItemsSchema.optional(),
  })
  .strict()
export type ReactFacade = z.infer<typeof ReactFacadeSchema>
