import { z } from 'zod'
import { JsonValueSchema, validateJsonExtensionFields } from './jsonValue'
import { IdRefListSchema, KeySchema, KeyTokenSchema, type Key } from './keys'
import { validatePatternDataRefs } from './patternDataValidation'
import { PatternStateSchema, type PatternState } from './patternState'

export { IdRefListSchema, KeySchema, KeyTokenSchema }
export type { Key }

export const PatternItemSchema = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    textValue: z.string().optional(),
    itemValue: JsonValueSchema.optional(),
    kind: z.string().optional(),
  })
  .passthrough()
  .superRefine((value, ctx) => validateJsonExtensionFields(value, ['label', 'labelledBy', 'textValue', 'itemValue', 'kind'], ctx))

export type PatternItem = z.infer<typeof PatternItemSchema>

export const PatternRelationsSchema = z
  .object({
    rootKeys: z.array(KeySchema).readonly().optional(),
    childrenByKey: z.record(KeySchema, z.array(KeySchema).readonly()).optional(),
    ownerByKey: z.record(KeySchema, KeySchema).optional(),
    controlsByKey: z.record(KeySchema, z.array(KeySchema).readonly()).optional(),
    rowKeys: z.array(KeySchema).readonly().optional(),
    columnKeys: z.array(KeySchema).readonly().optional(),
    cells: z
      .array(z.object({ rowKey: KeySchema, columnKey: KeySchema, cellKey: KeySchema }).strict())
      .readonly()
      .optional(),
  })
  .strict()

export { PatternStateSchema }
export type { PatternState }

export const PatternRefsSchema = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    initialFocusKey: KeySchema.optional(),
    domainIdByKey: z.record(KeySchema, z.string()).optional(),
    pointerByKey: z.record(KeySchema, z.string()).optional(),
  })
  .strict()

export const PatternDataSchema = z
  .object({
    items: z.record(KeySchema, PatternItemSchema),
    relations: PatternRelationsSchema.optional(),
    state: PatternStateSchema.optional(),
    refs: PatternRefsSchema.optional(),
  })
  .strict()
  .superRefine(validatePatternDataRefs)

export type PatternData<
  TItem extends PatternItem = PatternItem,
  TState extends PatternState = PatternState,
> = Omit<z.infer<typeof PatternDataSchema>, 'items' | 'state'> & {
  items: Record<Key, TItem>
  state?: TState
}
