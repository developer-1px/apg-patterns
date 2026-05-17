import { useState } from 'react'
import type { PatternData, PatternEvent, PatternOptions } from '../../../src'
import { reduceData, resolveTarget } from '../demoData'
import { renderAriaTree, renderHtmlTree } from '../inspect'
import { Tree } from '../Tree'
import { treeVariants, type TreeVariantKey } from '../treeVariants'
import { TreeVariantMenu } from '../TreeVariantMenu'
import { type PatternEntry, selectClass } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'treeview',
  label: 'Treeview',
  order: 1,
  useDemoPattern: (onEvent) => {
    const [treeVariant, setTreeVariant] = useState<TreeVariantKey>('fileDirectoryComputed')
    const [treeData, setTreeData] = useState<PatternData>(treeVariants.fileDirectoryComputed.data)
    const [followFocus, setFollowFocus] = useState(false)
    const [focusStrategy, setFocusStrategy] = useState<'rovingTabIndex' | 'ariaActiveDescendant'>('rovingTabIndex')
    const [itemClickAction, setItemClickAction] = useState<'select' | 'toggleExpand' | 'none'>('select')
    const [inspectMode, setInspectMode] = useState<'aria' | 'html'>('aria')
    const treeOptions: PatternOptions = { focusStrategy, followFocus, itemClickAction, indicatorClickAction: 'toggleExpand' }
    const dispatchTree = (event: PatternEvent | { type: 'reset' }) => {
      if (event.type === 'reset') return setTreeData(treeVariants[treeVariant].data)
      setTreeData((current) => reduceData(current, event))
    }
    const handleTreeEvent = (event: PatternEvent) => {
      onEvent(event)
      if (event.type !== 'navigate') return dispatchTree(event)
      const target = resolveTarget(event.direction, treeData)
      if (!target) return
      dispatchTree({ type: 'focus', key: target })
      if (followFocus) dispatchTree({ type: 'select', keys: [target], anchorKey: target, extentKey: target })
    }

    return {
      key: 'treeview',
      label: 'Treeview',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft', 'Enter', 'Space'],
      sourceNames: ['Tree.tsx', 'TreeVariantMenu.tsx', 'treeVariants.ts', 'react.ts', 'treeview/runtime.ts', 'treeview/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts', 'demoData.ts'],
      inspect: inspectMode === 'aria' ? renderAriaTree(treeData, treeOptions) : renderHtmlTree(treeData, treeOptions),
      inspectControls: (
        <select className={selectClass} value={inspectMode} onChange={(event) => setInspectMode(event.currentTarget.value as typeof inspectMode)}>
          <option value="aria">aria</option>
          <option value="html">html</option>
        </select>
      ),
      variants: (
        <div className="grid gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <TreeVariantMenu value={treeVariant} onChange={(variant) => {
            setTreeVariant(variant)
            setTreeData(treeVariants[variant].data)
          }} />
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={followFocus} onChange={(event) => setFollowFocus(event.currentTarget.checked)} />
            followFocus
          </label>
          <label className="grid gap-1">
            itemClickAction
            <select className={selectClass} value={itemClickAction} onChange={(event) => setItemClickAction(event.currentTarget.value as typeof itemClickAction)}>
              <option value="select">select</option>
              <option value="toggleExpand">toggleExpand</option>
              <option value="none">none</option>
            </select>
          </label>
          <label className="grid gap-1">
            focusStrategy
            <select className={selectClass} value={focusStrategy} onChange={(event) => setFocusStrategy(event.currentTarget.value as typeof focusStrategy)}>
              <option value="rovingTabIndex">rovingTabIndex</option>
              <option value="ariaActiveDescendant">ariaActiveDescendant</option>
            </select>
          </label>
        </div>
      ),
      preview: <Tree data={treeData} options={treeOptions} onEvent={handleTreeEvent} />,
      reset: () => dispatchTree({ type: 'reset' }),
    }
  },
}
