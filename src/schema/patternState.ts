import { z } from 'zod'
import { validateJsonExtensionFields } from './jsonValue'
import { KeySchema } from './keys'

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
    rowCount: z.number().int().nonnegative().optional(),
    colCount: z.number().int().nonnegative().optional(),
    editingKey: KeySchema.nullish(),
    editDraftByKey: z.record(KeySchema, z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
    lastEventReason: z.string().optional(),
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
        'rowCount',
        'colCount',
        'editingKey',
        'editDraftByKey',
        'lastEventReason',
      ],
      ctx,
    ),
  )

export type PatternState = z.infer<typeof PatternStateSchema>
