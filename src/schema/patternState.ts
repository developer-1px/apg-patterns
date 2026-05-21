import { z } from 'zod'
import { validateJsonExtensionFields } from './jsonValue'
import { KeySchema, type Key } from './keys'

type ItemToggleState = boolean | 'mixed'
type ItemCurrentState = boolean | string
type ItemInvalidState = boolean | 'grammar' | 'spelling'
type ItemValue = string | number | boolean | null

interface RangeValue {
  min?: number
  max?: number
  now: number
  text?: string
}

export interface PatternState {
  activeKey?: Key | null
  anchorKey?: Key | null
  extentKey?: Key | null
  selectedKeys?: readonly Key[]
  expandedKeys?: readonly Key[]
  disabledKeys?: readonly Key[]
  checkedByKey?: Record<Key, ItemToggleState>
  pressedByKey?: Record<Key, ItemToggleState>
  currentByKey?: Record<Key, ItemCurrentState>
  invalidByKey?: Record<Key, ItemInvalidState>
  requiredKeys?: readonly Key[]
  busyKeys?: readonly Key[]
  modalKeys?: readonly Key[]
  levelByKey?: Record<Key, number>
  posInSetByKey?: Record<Key, number>
  setSizeByKey?: Record<Key, number>
  rowIndexByKey?: Record<Key, number>
  columnIndexByKey?: Record<Key, number>
  sortByKey?: Record<Key, 'ascending' | 'descending' | 'other'>
  valueByKey?: Record<Key, ItemValue>
  rangeValueByKey?: Record<Key, RangeValue>
  typeaheadTextByKey?: Record<Key, string>
  rowCount?: number
  colCount?: number
  editingKey?: Key | null
  editDraftByKey?: Record<Key, ItemValue>
  lastEventReason?: string
  [key: string]: unknown
}

export const PatternStateSchema: z.ZodType<PatternState> = z
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
