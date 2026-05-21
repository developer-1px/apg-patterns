import { z } from 'zod'
import { JsonValueSchema, validateJsonExtensionFields, type JsonValue } from './jsonValue'
import { IdRefListSchema, KeySchema, KeyTokenSchema, type Key } from './keys'
import { validatePatternDataRefs } from './patternDataValidation'
import { PatternStateSchema, type PatternState } from './patternState'

export { IdRefListSchema, KeySchema, KeyTokenSchema }
export type { Key }

export interface PatternItem {
  label?: string
  labelledBy?: string | readonly string[]
  textValue?: string
  itemValue?: JsonValue
  kind?: string
  [key: string]: unknown
}

export const PatternItemSchema: z.ZodType<PatternItem> = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    textValue: z.string().optional(),
    itemValue: JsonValueSchema.optional(),
    kind: z.string().optional(),
  })
  .passthrough()
  .superRefine((value, ctx) => validateJsonExtensionFields(value, ['label', 'labelledBy', 'textValue', 'itemValue', 'kind'], ctx))

interface PatternRelations {
  rootKeys?: readonly Key[]
  childrenByKey?: Record<Key, readonly Key[]>
  ownerByKey?: Record<Key, Key>
  controlsByKey?: Record<Key, readonly Key[]>
  rowKeys?: readonly Key[]
  columnKeys?: readonly Key[]
  cells?: readonly { rowKey: Key; columnKey: Key; cellKey: Key }[]
}

export const PatternRelationsSchema: z.ZodType<PatternRelations> = z
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

interface PatternRefs {
  label?: string
  labelledBy?: string | readonly string[]
  initialFocusKey?: Key
  domainIdByKey?: Record<Key, string>
  pointerByKey?: Record<Key, string>
}

export const PatternRefsSchema: z.ZodType<PatternRefs> = z
  .object({
    label: z.string().optional(),
    labelledBy: IdRefListSchema.optional(),
    initialFocusKey: KeySchema.optional(),
    domainIdByKey: z.record(KeySchema, z.string()).optional(),
    pointerByKey: z.record(KeySchema, z.string()).optional(),
  })
  .strict()

export type PatternData<
  TItem extends PatternItem = PatternItem,
  TState extends PatternState = PatternState,
> = {
  items: Record<Key, TItem>
  relations?: PatternRelations
  state?: TState
  refs?: PatternRefs
}

export const PatternDataSchema: z.ZodType<PatternData> = z
  .object({
    items: z.record(KeySchema, PatternItemSchema),
    relations: PatternRelationsSchema.optional(),
    state: PatternStateSchema.optional(),
    refs: PatternRefsSchema.optional(),
  })
  .strict()
  .superRefine(validatePatternDataRefs)
