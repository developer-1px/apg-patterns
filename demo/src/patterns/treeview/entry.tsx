import { useReducer } from 'react'
import { z } from 'zod'
import { PatternDataSchema } from '../../../../src'
import type { PatternData, PatternEvent, PatternOptions } from '../../../../src'
import { reduceData, resolveTarget } from './treeContract'
import { renderAriaTree, renderHtmlTree } from './inspect'
import { Tree } from './Tree'
import { treeVariantItems, treeVariants, type TreeVariantKey } from './treeVariants'
import { type PatternEntry, selectClass, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { VariantListbox } from '../../shared/VariantListbox'

const treeVariantKeys = ['fileDirectoryComputed', 'fileDirectoryDeclared', 'navigation'] as const
const focusStrategies = ['rovingTabIndex', 'ariaActiveDescendant'] as const
const itemClickActions = ['select', 'toggleExpand', 'none'] as const
const inspectModes = ['aria', 'html'] as const

const TreeviewDemoStateSchema = z.object({
  variant: z.enum(treeVariantKeys),
  data: PatternDataSchema,
  followFocus: z.boolean(),
  focusStrategy: z.enum(focusStrategies),
  itemClickAction: z.enum(itemClickActions),
  inspectMode: z.enum(inspectModes),
}).strict()

type TreeviewDemoState = z.infer<typeof TreeviewDemoStateSchema>

type TreeviewDemoAction =
  | { type: 'selectVariant'; variant: TreeVariantKey }
  | { type: 'setFollowFocus'; value: boolean }
  | { type: 'setFocusStrategy'; value: TreeviewDemoState['focusStrategy'] }
  | { type: 'setItemClickAction'; value: TreeviewDemoState['itemClickAction'] }
  | { type: 'setInspectMode'; value: TreeviewDemoState['inspectMode'] }
  | { type: 'patternEvent'; event: PatternEvent }

const initialTreeviewDemoState = TreeviewDemoStateSchema.parse({
  variant: 'fileDirectoryComputed',
  data: treeVariants.fileDirectoryComputed.data,
  followFocus: false,
  focusStrategy: 'rovingTabIndex',
  itemClickAction: 'select',
  inspectMode: 'aria',
})

const reduceTreeviewDemoState = (state: TreeviewDemoState, action: TreeviewDemoAction): TreeviewDemoState => {
  if (action.type === 'selectVariant') return TreeviewDemoStateSchema.parse({ ...state, variant: action.variant, data: treeVariants[action.variant].data })
  if (action.type === 'setFollowFocus') return TreeviewDemoStateSchema.parse({ ...state, followFocus: action.value })
  if (action.type === 'setFocusStrategy') return TreeviewDemoStateSchema.parse({ ...state, focusStrategy: action.value })
  if (action.type === 'setItemClickAction') return TreeviewDemoStateSchema.parse({ ...state, itemClickAction: action.value })
  if (action.type === 'setInspectMode') return TreeviewDemoStateSchema.parse({ ...state, inspectMode: action.value })
  return TreeviewDemoStateSchema.parse({ ...state, data: reduceData(state.data, action.event) })
}

export const entry: PatternEntry = {
  key: 'treeview',
  label: 'Treeview',
  useDemoPattern: (onEvent) => {
    const [state, dispatch] = useReducer(reduceTreeviewDemoState, initialTreeviewDemoState)
    const treeOptions: PatternOptions = { focusStrategy: state.focusStrategy, followFocus: state.followFocus, itemClickAction: state.itemClickAction, indicatorClickAction: 'toggleExpand' }
    const dispatchTree = (event: PatternEvent) => dispatch({ type: 'patternEvent', event })
    const handleTreeEvent = (event: PatternEvent) => {
      onEvent(event)
      if (event.type !== 'navigate') return dispatchTree(event)
      const target = resolveTarget(event.direction, state.data)
      if (!target) return
      const meta = event.meta
      dispatchTree({ type: 'focus', key: target, ...(meta ? { meta } : {}) })
      if (state.followFocus) dispatchTree({ type: 'select', keys: [target], anchorKey: target, extentKey: target, ...(meta ? { meta } : {}) })
    }

    return {
      key: 'treeview',
      label: 'Treeview',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft', 'Enter', 'Space'],
      sourceNames: ['Tree.tsx', 'treeview/entry.tsx', 'treeVariants.ts', 'treeview/useTreeviewPattern.ts', 'treeview/runtime.ts', 'treeview/definition.ts', ...KERNEL_SOURCES, 'treeContract.ts'],
      inspect: state.inspectMode === 'aria' ? renderAriaTree(state.data, treeOptions) : renderHtmlTree(state.data, treeOptions),
      inspectControls: (
        <select className={selectClass} value={state.inspectMode} onChange={(event) => dispatch({ type: 'setInspectMode', value: parseInspectMode(event.currentTarget.value) })}>
          <option value="aria">aria</option>
          <option value="html">html</option>
        </select>
      ),
      variants: (
        <div className="grid gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <VariantListbox value={state.variant} items={treeVariantItems} label="tree variants" idPrefix="tree-variant" onChange={(variant) => dispatch({ type: 'selectVariant', variant })} />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 rounded bg-white text-zinc-900 accent-zinc-900 shadow-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.08] dark:accent-zinc-100 dark:focus-visible:outline-zinc-500"
              checked={state.followFocus}
              onChange={(event) => dispatch({ type: 'setFollowFocus', value: event.currentTarget.checked })}
            />
            followFocus
          </label>
          <label className="grid gap-1">
            itemClickAction
            <select className={selectClass} value={state.itemClickAction} onChange={(event) => dispatch({ type: 'setItemClickAction', value: parseItemClickAction(event.currentTarget.value) })}>
              <option value="select">select</option>
              <option value="toggleExpand">toggleExpand</option>
              <option value="none">none</option>
            </select>
          </label>
          <label className="grid gap-1">
            focusStrategy
            <select className={selectClass} value={state.focusStrategy} onChange={(event) => dispatch({ type: 'setFocusStrategy', value: parseFocusStrategy(event.currentTarget.value) })}>
              <option value="rovingTabIndex">rovingTabIndex</option>
              <option value="ariaActiveDescendant">ariaActiveDescendant</option>
            </select>
          </label>
        </div>
      ),
      preview: <Tree data={state.data} onEvent={handleTreeEvent} options={treeOptions} />,
    }
  },
}

function parseInspectMode(value: string): TreeviewDemoState['inspectMode'] {
  return z.enum(inspectModes).parse(value)
}

function parseItemClickAction(value: string): TreeviewDemoState['itemClickAction'] {
  return z.enum(itemClickActions).parse(value)
}

function parseFocusStrategy(value: string): TreeviewDemoState['focusStrategy'] {
  return z.enum(focusStrategies).parse(value)
}
