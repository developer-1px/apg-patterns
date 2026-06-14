import { z } from 'zod'
import { KeyTokenSchema } from './keys'

export const VisibleOrderKindSchema = z.enum([
  'flat', 'comboboxOptions', 'gridRows', 'treeVisibleDepthFirst', 'treegridVisibleCells',
])
export type VisibleOrderKind = z.infer<typeof VisibleOrderKindSchema>

export const NavigationTargetKindSchema = z.enum([
  'linear', 'linearWrap', 'firstChild', 'gridCell', 'gridPage', 'optionLinear',
  'parentKey', 'radioLinear', 'tabsLinear', 'treegridCell', 'treegridPage', 'treegridParentRowFirstCell',
  'treegridRow', 'treegridRowPage',
])
export type NavigationTargetKind = z.infer<typeof NavigationTargetKindSchema>

const LinearActionSchema = z.enum(['next', 'previous', 'first', 'last'])
const GridActionSchema = z.enum(['left', 'right', 'up', 'down', 'rowStart', 'rowEnd', 'gridStart', 'gridEnd'])
const GridPageActionSchema = z.enum(['pageUp', 'pageDown'])
const TreegridPageDirectionSchema = z.enum(['up', 'down'])

type LinearAction = 'next' | 'previous' | 'first' | 'last'
type GridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'
type GridPageAction = 'pageUp' | 'pageDown'
type TreegridPageDirection = 'up' | 'down'
type KeyToken = string

type NavigationTarget =
  | { kind: 'linear'; action: LinearAction }
  | { kind: 'linearWrap'; action: 'next' | 'previous' }
  | { kind: 'firstChild'; key?: KeyToken }
  | { kind: 'gridCell'; action: GridAction }
  | { kind: 'gridPage'; action: GridPageAction }
  | { kind: 'optionLinear'; direction: LinearAction }
  | { kind: 'parentKey'; key: KeyToken }
  | { kind: 'radioLinear'; action: LinearAction }
  | { kind: 'tabsLinear'; action: LinearAction }
  | { kind: 'treegridCell'; action: GridAction }
  | { kind: 'treegridPage'; direction: TreegridPageDirection }
  | { kind: 'treegridParentRowFirstCell' }
  | { kind: 'treegridRow'; action: 'up' | 'down' | 'gridStart' | 'gridEnd' }
  | { kind: 'treegridRowPage'; direction: TreegridPageDirection }

type VisibleOrder =
  | { kind: 'flat' }
  | { kind: 'comboboxOptions' }
  | { kind: 'gridRows' }
  | { kind: 'treeVisibleDepthFirst' }
  | { kind: 'treegridVisibleCells' }
  | { kind: 'treegridVisibleRows' }

interface Navigation {
  visibleOrder: VisibleOrder
  targets: Record<string, NavigationTarget>
}

export const NavigationTargetSchema: z.ZodType<NavigationTarget> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('linear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('linearWrap'), action: z.enum(['next', 'previous']) }).strict(),
  z.object({ kind: z.literal('firstChild'), key: KeyTokenSchema.optional() }).strict(),
  z.object({ kind: z.literal('gridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('gridPage'), action: GridPageActionSchema }).strict(),
  z.object({ kind: z.literal('optionLinear'), direction: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('parentKey'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('radioLinear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('tabsLinear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('treegridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('treegridPage'), direction: TreegridPageDirectionSchema }).strict(),
  z.object({ kind: z.literal('treegridParentRowFirstCell') }).strict(),
  z.object({ kind: z.literal('treegridRow'), action: z.enum(['up', 'down', 'gridStart', 'gridEnd']) }).strict(),
  z.object({ kind: z.literal('treegridRowPage'), direction: TreegridPageDirectionSchema }).strict(),
])

export const VisibleOrderSchema: z.ZodType<VisibleOrder> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('flat') }).strict(),
  z.object({ kind: z.literal('comboboxOptions') }).strict(),
  z.object({ kind: z.literal('gridRows') }).strict(),
  z.object({ kind: z.literal('treeVisibleDepthFirst') }).strict(),
  z.object({ kind: z.literal('treegridVisibleCells') }).strict(),
  z.object({ kind: z.literal('treegridVisibleRows') }).strict(),
])

export const NavigationSchema: z.ZodType<Navigation> = z
  .object({
    visibleOrder: VisibleOrderSchema,
    targets: z.record(z.string().min(1), NavigationTargetSchema),
  })
  .strict()
