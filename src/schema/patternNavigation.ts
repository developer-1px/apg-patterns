import { z } from 'zod'
import { KeyTokenSchema } from './keys'

export const VisibleOrderKindSchema = z.enum([
  'flat', 'comboboxOptions', 'gridRows', 'treeVisibleDepthFirst', 'treegridVisibleCells',
])
export type VisibleOrderKind = z.infer<typeof VisibleOrderKindSchema>

export const NavigationTargetKindSchema = z.enum([
  'linear', 'linearWrap', 'firstChild', 'gridCell', 'gridPage', 'optionLinear',
  'parentKey', 'tabsLinear', 'treegridCell', 'treegridPage', 'treegridParentRowFirstCell',
  'treegridRow', 'treegridRowPage',
])
export type NavigationTargetKind = z.infer<typeof NavigationTargetKindSchema>

const LinearActionSchema = z.enum(['next', 'previous', 'first', 'last'])
const GridActionSchema = z.enum(['left', 'right', 'up', 'down', 'rowStart', 'rowEnd', 'gridStart', 'gridEnd'])
const GridPageActionSchema = z.enum(['pageUp', 'pageDown'])
const TreegridPageDirectionSchema = z.enum(['up', 'down'])

export const NavigationTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('linear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('linearWrap'), action: z.enum(['next', 'previous']) }).strict(),
  z.object({ kind: z.literal('firstChild'), key: KeyTokenSchema.optional() }).strict(),
  z.object({ kind: z.literal('gridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('gridPage'), action: GridPageActionSchema }).strict(),
  z.object({ kind: z.literal('optionLinear'), direction: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('parentKey'), key: KeyTokenSchema }).strict(),
  z.object({ kind: z.literal('tabsLinear'), action: LinearActionSchema }).strict(),
  z.object({ kind: z.literal('treegridCell'), action: GridActionSchema }).strict(),
  z.object({ kind: z.literal('treegridPage'), direction: TreegridPageDirectionSchema }).strict(),
  z.object({ kind: z.literal('treegridParentRowFirstCell') }).strict(),
  z.object({ kind: z.literal('treegridRow'), action: z.enum(['up', 'down', 'gridStart', 'gridEnd']) }).strict(),
  z.object({ kind: z.literal('treegridRowPage'), direction: TreegridPageDirectionSchema }).strict(),
])

export const VisibleOrderSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('flat') }).strict(),
  z.object({ kind: z.literal('comboboxOptions') }).strict(),
  z.object({ kind: z.literal('gridRows') }).strict(),
  z.object({ kind: z.literal('treeVisibleDepthFirst') }).strict(),
  z.object({ kind: z.literal('treegridVisibleCells') }).strict(),
  z.object({ kind: z.literal('treegridVisibleRows') }).strict(),
])

export const NavigationSchema = z
  .object({
    visibleOrder: VisibleOrderSchema,
    targets: z.record(z.string().min(1), NavigationTargetSchema),
  })
  .strict()
