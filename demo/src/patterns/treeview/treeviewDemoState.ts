import { z } from 'zod'
import { PatternDataSchema, type PatternEvent } from '../../../../src/react'
import { reduceData } from './treeContract'
import { treeVariants, type TreeVariantKey } from './treeVariants'

const treeVariantKeys = ['fileDirectoryComputed', 'fileDirectoryDeclared', 'navigation', 'interactionOwnership', 'pageInteractionRecovery'] as const
const focusStrategies = ['rovingTabIndex', 'ariaActiveDescendant'] as const
const itemClickActions = ['select', 'toggleExpand', 'none'] as const

const TreeviewDemoStateSchema = z.object({
  variant: z.enum(treeVariantKeys),
  data: PatternDataSchema,
  followFocus: z.boolean(),
  focusStrategy: z.enum(focusStrategies),
  itemClickAction: z.enum(itemClickActions),
}).strict()

export type TreeviewDemoState = z.infer<typeof TreeviewDemoStateSchema>

type TreeviewDemoAction =
  | { type: 'selectVariant'; variant: TreeVariantKey }
  | { type: 'setFollowFocus'; value: boolean }
  | { type: 'setFocusStrategy'; value: TreeviewDemoState['focusStrategy'] }
  | { type: 'setItemClickAction'; value: TreeviewDemoState['itemClickAction'] }
  | { type: 'patternEvent'; event: PatternEvent }

export const initialTreeviewDemoState = TreeviewDemoStateSchema.parse({
  variant: 'fileDirectoryComputed',
  data: treeVariants.fileDirectoryComputed.data,
  followFocus: false,
  focusStrategy: 'rovingTabIndex',
  itemClickAction: 'select',
})

export const reduceTreeviewDemoState = (state: TreeviewDemoState, action: TreeviewDemoAction): TreeviewDemoState => {
  if (action.type === 'selectVariant') return TreeviewDemoStateSchema.parse({ ...state, variant: action.variant, data: treeVariants[action.variant].data })
  if (action.type === 'setFollowFocus') return TreeviewDemoStateSchema.parse({ ...state, followFocus: action.value })
  if (action.type === 'setFocusStrategy') return TreeviewDemoStateSchema.parse({ ...state, focusStrategy: action.value })
  if (action.type === 'setItemClickAction') return TreeviewDemoStateSchema.parse({ ...state, itemClickAction: action.value })
  return TreeviewDemoStateSchema.parse({ ...state, data: reduceData(state.data, action.event) })
}

export function parseItemClickAction(value: string): TreeviewDemoState['itemClickAction'] {
  return z.enum(itemClickActions).parse(value)
}

export function parseFocusStrategy(value: string): TreeviewDemoState['focusStrategy'] {
  return z.enum(focusStrategies).parse(value)
}
