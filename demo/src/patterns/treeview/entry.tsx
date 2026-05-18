import { useReducer } from 'react'
import type { PatternEvent, PatternOptions } from '../../../../src'
import { resolveTarget } from './treeContract'
import { renderAriaTree, renderHtmlTree } from './inspect'
import { Tree } from './Tree'
import { treeVariantItems, treeVariants, type TreeVariantKey } from './treeVariants'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import {
  FocusStrategyControl,
  FollowFocusControl,
  InspectModeControl,
  ItemClickActionControl,
} from './TreeviewControls'
import {
  initialTreeviewDemoState,
  reduceTreeviewDemoState,
  type TreeviewDemoState,
} from './treeviewDemoState'

const treeviewDemoDefinition = {
  key: 'treeview',
  label: 'Treeview',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft', 'Enter', 'Space'],
  sources: {
    main: 'Tree.tsx',
    entry: 'treeview/entry.tsx',
    data: ['treeVariants.ts'],
    hooks: ['treeview/useTreeviewPattern.ts'],
    runtime: ['treeview/runtime.ts', 'treeview/navigation.ts', 'treeview/typeahead.ts', 'treeview/keyboard.ts', 'treeview/keyboardBinding.ts', 'treeview/adaptTreeviewProps.ts', 'treeview/adaptTreeviewRuntime.ts', 'treeview/createTreeviewRenderItems.ts', 'treeview/renderItem.ts', 'treeview/treeProps.ts', 'treeview/react.ts', 'treeview/runtimeCompatibility.ts'],
    definition: 'treeview/definition.ts',
    extra: ['treeContract.ts', 'treeview/inspect.ts', 'treeview/renderState.ts'],
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
        <InspectModeControl value={state.inspectMode} onChange={(value) => dispatch({ type: 'setInspectMode', value })} />
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
