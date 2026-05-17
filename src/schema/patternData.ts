import { z } from 'zod'
import { JsonValueSchema, validateJsonExtensionFields } from './jsonValue'
import { validatePatternDataRefs } from './patternDataValidation'

export const KeySchema = z.string().min(1)
export type Key = z.infer<typeof KeySchema>

export const IdRefListSchema = z.union([KeySchema, z.array(KeySchema).readonly()])
export const KeyTokenSchema = z.string().min(1).startsWith('$')

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

export const PatternStateSchema = z
  .object({
    activeKey: KeySchema.nullish(),
    anchorKey: KeySchema.nullish(),
    extentKey: KeySchema.nullish(),
    selectedKeys: z.array(KeySchema).readonly().optional(),
    expandedKeys: z.array(KeySchema).readonly().optional(),
    disabledKeys: z.array(KeySchema).readonly().optional(),
    checkedByKey: z.record(KeySchema, z.union([z.boolean(), z.literal('mixed')])).optional(),
    pressedByKey: z.record(KeySchema, z.union([z.boolean(), z.literal('mixed')])).optional(),
    currentByKey: z.record(KeySchema, z.union([z.boolean(), z.string()])).optional(),
    invalidByKey: z.record(KeySchema, z.union([z.boolean(), z.enum(['grammar', 'spelling'])])).optional(),
    requiredKeys: z.array(KeySchema).readonly().optional(),
    busyKeys: z.array(KeySchema).readonly().optional(),
    modalKeys: z.array(KeySchema).readonly().optional(),
    levelByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    posInSetByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    setSizeByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    rowIndexByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    columnIndexByKey: z.record(KeySchema, z.number().int().positive()).optional(),
    sortByKey: z.record(KeySchema, z.enum(['ascending', 'descending', 'other'])).optional(),
    valueByKey: z.record(KeySchema, z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    rangeValueByKey: z.record(KeySchema, z.object({ min: z.number().optional(), max: z.number().optional(), now: z.number(), text: z.string().optional() }).strict()).optional(),
    typeaheadTextByKey: z.record(KeySchema, z.string()).optional(),
  })
  .passthrough()
  .superRefine((value, ctx) =>
    validateJsonExtensionFields(
      value,
      [
        'activeKey',
        'anchorKey',
        'extentKey',
        'selectedKeys',
        'expandedKeys',
        'disabledKeys',
        'checkedByKey',
        'pressedByKey',
        'currentByKey',
        'invalidByKey',
        'requiredKeys',
        'busyKeys',
        'modalKeys',
        'levelByKey',
        'posInSetByKey',
        'setSizeByKey',
        'rowIndexByKey',
        'columnIndexByKey',
        'sortByKey',
        'valueByKey',
        'rangeValueByKey',
        'typeaheadTextByKey',
      ],
      ctx,
    ),
  )

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

export type PatternData = z.infer<typeof PatternDataSchema>
