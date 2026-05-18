import { z } from 'zod'
import { PatternDataSchema, type PatternEvent } from '../../../../src'
import { reduceData } from './treeContract'
import { treeVariants, type TreeVariantKey } from './treeVariants'

export const treeVariantKeys = ['fileDirectoryComputed', 'fileDirectoryDeclared', 'navigation'] as const
export const focusStrategies = ['rovingTabIndex', 'ariaActiveDescendant'] as const
export const itemClickActions = ['select', 'toggleExpand', 'none'] as const
export const inspectModes = ['aria', 'html'] as const

export const TreeviewDemoStateSchema = z.object({
  variant: z.enum(treeVariantKeys),
  data: PatternDataSchema,
  followFocus: z.boolean(),
  focusStrategy: z.enum(focusStrategies),
  itemClickAction: z.enum(itemClickActions),
  inspectMode: z.enum(inspectModes),
}).strict()

export type TreeviewDemoState = z.infer<typeof TreeviewDemoStateSchema>

export type TreeviewDemoAction =
  | { type: 'selectVariant'; variant: TreeVariantKey }
  | { type: 'setFollowFocus'; value: boolean }
  | { type: 'setFocusStrategy'; value: TreeviewDemoState['focusStrategy'] }
  | { type: 'setItemClickAction'; value: TreeviewDemoState['itemClickAction'] }
  | { type: 'setInspectMode'; value: TreeviewDemoState['inspectMode'] }
  | { type: 'patternEvent'; event: PatternEvent }

export const initialTreeviewDemoState = TreeviewDemoStateSchema.parse({
  variant: 'fileDirectoryComputed',
  data: treeVariants.fileDirectoryComputed.data,
  followFocus: false,
  focusStrategy: 'rovingTabIndex',
  itemClickAction: 'select',
  inspectMode: 'aria',
})

export const reduceTreeviewDemoState = (state: TreeviewDemoState, action: TreeviewDemoAction): TreeviewDemoState => {
  if (action.type === 'selectVariant') return TreeviewDemoStateSchema.parse({ ...state, variant: action.variant, data: treeVariants[action.variant].data })
  if (action.type === 'setFollowFocus') return TreeviewDemoStateSchema.parse({ ...state, followFocus: action.value })
  if (action.type === 'setFocusStrategy') return TreeviewDemoStateSchema.parse({ ...state, focusStrategy: action.value })
  if (action.type === 'setItemClickAction') return TreeviewDemoStateSchema.parse({ ...state, itemClickAction: action.value })
  if (action.type === 'setInspectMode') return TreeviewDemoStateSchema.parse({ ...state, inspectMode: action.value })
  return TreeviewDemoStateSchema.parse({ ...state, data: reduceData(state.data, action.event) })
}

export function parseInspectMode(value: string): TreeviewDemoState['inspectMode'] {
  return z.enum(inspectModes).parse(value)
}

export function parseItemClickAction(value: string): TreeviewDemoState['itemClickAction'] {
  return z.enum(itemClickActions).parse(value)
}

export function parseFocusStrategy(value: string): TreeviewDemoState['focusStrategy'] {
  return z.enum(focusStrategies).parse(value)
}
