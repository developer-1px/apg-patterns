import { useReducer } from 'react'
import { z } from 'zod'
import { PatternDataSchema } from '../../../../src'
import type { PatternData, PatternEvent, PatternOptions } from '../../../../src'
import { reduceData, resolveTarget } from './treeContract'
import { renderAriaTree, renderHtmlTree } from './inspect'
import { Tree } from './Tree'
import { treeVariantItems, treeVariants, type TreeVariantKey } from './treeVariants'
import { selectClass } from '../../shared/demoPatternTypes'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

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

const treeviewDemoDefinition = {
  key: 'treeview',
  label: 'Treeview',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft', 'Enter', 'Space'],
  sources: {
    main: 'Tree.tsx',
    entry: 'treeview/entry.tsx',
    data: ['treeVariants.ts'],
    hooks: ['treeview/useTreeviewPattern.ts'],
    runtime: ['treeview/runtime.ts'],
    definition: 'treeview/definition.ts',
    extra: ['treeContract.ts'],
  },
  controls: {
    kind: 'stack',
    gap: 'md',
    children: [
      {
        kind: 'listbox',
        value: '$state.variant',
        items: '$model.variantItems',
        label: 'tree variants',
        idPrefix: 'tree-variant',
        onChange: '$actions.selectVariant',
      },
      {
        kind: 'component',
        component: 'FollowFocusControl',
        props: {
          value: '$state.followFocus',
          onChange: '$actions.setFollowFocus',
        },
      },
      {
        kind: 'component',
        component: 'ItemClickActionControl',
        props: {
          value: '$state.itemClickAction',
          onChange: '$actions.setItemClickAction',
        },
      },
      {
        kind: 'component',
        component: 'FocusStrategyControl',
        props: {
          value: '$state.focusStrategy',
          onChange: '$actions.setFocusStrategy',
        },
      },
    ],
  },
  view: {
    kind: 'component',
    component: 'Tree',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

const reduceTreeviewDemoState = (state: TreeviewDemoState, action: TreeviewDemoAction): TreeviewDemoState => {
  if (action.type === 'selectVariant') return TreeviewDemoStateSchema.parse({ ...state, variant: action.variant, data: treeVariants[action.variant].data })
  if (action.type === 'setFollowFocus') return TreeviewDemoStateSchema.parse({ ...state, followFocus: action.value })
  if (action.type === 'setFocusStrategy') return TreeviewDemoStateSchema.parse({ ...state, focusStrategy: action.value })
  if (action.type === 'setItemClickAction') return TreeviewDemoStateSchema.parse({ ...state, itemClickAction: action.value })
  if (action.type === 'setInspectMode') return TreeviewDemoStateSchema.parse({ ...state, inspectMode: action.value })
  return TreeviewDemoStateSchema.parse({ ...state, data: reduceData(state.data, action.event) })
}

export const entry = defineDemoPattern({
  definition: treeviewDemoDefinition,
  useRuntime: (onEvent) => {
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
      inspect: state.inspectMode === 'aria' ? renderAriaTree(state.data, treeOptions) : renderHtmlTree(state.data, treeOptions),
      inspectControls: (
        <select className={selectClass} value={state.inspectMode} onChange={(event) => dispatch({ type: 'setInspectMode', value: parseInspectMode(event.currentTarget.value) })}>
          <option value="aria">aria</option>
          <option value="html">html</option>
        </select>
      ),
      context: {
        values: {
          state: {
            variant: state.variant,
            data: state.data,
            options: treeOptions,
            followFocus: state.followFocus,
            itemClickAction: state.itemClickAction,
            focusStrategy: state.focusStrategy,
          },
          model: {
            variantItems: treeVariantItems,
          },
        },
        actions: {
          selectVariant: (variant: TreeVariantKey) => dispatch({ type: 'selectVariant', variant }),
          setFollowFocus: (value: boolean) => dispatch({ type: 'setFollowFocus', value }),
          setItemClickAction: (value: TreeviewDemoState['itemClickAction']) => dispatch({ type: 'setItemClickAction', value }),
          setFocusStrategy: (value: TreeviewDemoState['focusStrategy']) => dispatch({ type: 'setFocusStrategy', value }),
          dispatchEvent: handleTreeEvent,
        },
        components: {
          Tree,
          FollowFocusControl,
          ItemClickActionControl,
          FocusStrategyControl,
        },
      },
    }
  },
})

function FollowFocusControl({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      <input
        type="checkbox"
        className="size-4 rounded bg-white text-zinc-900 accent-zinc-900 shadow-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.08] dark:accent-zinc-100 dark:focus-visible:outline-zinc-500"
        checked={value}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      followFocus
    </label>
  )
}

function ItemClickActionControl({
  value,
  onChange,
}: {
  value: TreeviewDemoState['itemClickAction']
  onChange: (value: TreeviewDemoState['itemClickAction']) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      itemClickAction
      <select className={selectClass} value={value} onChange={(event) => onChange(parseItemClickAction(event.currentTarget.value))}>
        <option value="select">select</option>
        <option value="toggleExpand">toggleExpand</option>
        <option value="none">none</option>
      </select>
    </label>
  )
}

function FocusStrategyControl({
  value,
  onChange,
}: {
  value: TreeviewDemoState['focusStrategy']
  onChange: (value: TreeviewDemoState['focusStrategy']) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      focusStrategy
      <select className={selectClass} value={value} onChange={(event) => onChange(parseFocusStrategy(event.currentTarget.value))}>
        <option value="rovingTabIndex">rovingTabIndex</option>
        <option value="ariaActiveDescendant">ariaActiveDescendant</option>
      </select>
    </label>
  )
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
