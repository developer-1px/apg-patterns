import { useMemo, useState } from 'react'
import { gridDefinition, listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { initialData, reduceData, resolveTarget } from './demoData'
import { Grid } from './Grid'
import { gridVariants, type GridVariantKey } from './gridData'
import { GridVariantMenu } from './GridVariantMenu'
import { renderAriaTree, renderGridInspect, renderHtmlTree, renderListboxInspect } from './inspect'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'
import { Tree } from './Tree'
import { treeVariants, type TreeVariantKey } from './treeVariants'
import { TreeVariantMenu } from './TreeVariantMenu'
import { type DemoPattern, type EmitPatternEvent, selectClass } from './demoPatternTypes'
import { VariantListbox } from './VariantListbox'

export type ListboxVariantKey = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

const listboxVariantItems: readonly { key: ListboxVariantKey; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'scrollable', label: 'Scrollable' },
  { key: 'grouped', label: 'Grouped' },
  { key: 'rearrangeable', label: 'Rearrangeable (single-select)' },
  { key: 'rearrangeableMulti', label: 'Rearrangeable (multi-select)' },
]

export function useCollectionDemoPatterns(onEvent: EmitPatternEvent): readonly DemoPattern[] {
  return [
    useTreeDemoPattern(onEvent),
    useListboxDemoPattern(onEvent),
    useGridDemoPattern(onEvent),
  ]
}

function useTreeDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [treeVariant, setTreeVariant] = useState<TreeVariantKey>('fileDirectoryComputed')
  const [treeData, setTreeData] = useState<PatternData>(treeVariants.fileDirectoryComputed.data)
  const [followFocus, setFollowFocus] = useState(false)
  const [focusStrategy, setFocusStrategy] = useState<'rovingTabIndex' | 'ariaActiveDescendant'>('rovingTabIndex')
  const [itemClickAction, setItemClickAction] = useState<'select' | 'toggleExpand' | 'none'>('select')
  const [inspectMode, setInspectMode] = useState<'aria' | 'html'>('aria')
  const treeOptions = useMemo<PatternOptions>(
    () => ({ focusStrategy, followFocus, itemClickAction, indicatorClickAction: 'toggleExpand' }),
    [focusStrategy, followFocus, itemClickAction],
  )
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
    sourceNames: ['Tree.tsx', 'TreeVariantMenu.tsx', 'treeVariants.ts', 'useTreeDomFocus.ts', 'react.ts', 'treeview/runtime.ts', 'treeview/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts', 'demoData.ts'],
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
}

function useListboxDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const initialByVariant: Record<ListboxVariantKey, PatternData> = {
    basic: initialListboxData,
    scrollable: initialScrollableListboxData,
    grouped: initialGroupedListboxData,
    rearrangeable: initialRearrangeableListboxData,
    rearrangeableMulti: initialRearrangeableListboxData,
  }
  const [variant, setVariant] = useState<ListboxVariantKey>('basic')
  const [data, setData] = useState<PatternData>(initialListboxData)
  const options: PatternOptions = variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
  const handleEvent = (event: PatternEvent) => {
    onEvent(event)
    setData((current) => reducePatternData(listboxDefinition, current, event))
  }
  const preview = variant === 'scrollable'
    ? <Listbox data={data} options={options} scrollable onEvent={handleEvent} />
    : variant === 'grouped'
      ? <Listbox data={data} options={options} groups={groupedListboxStructure} onEvent={handleEvent} />
      : variant === 'rearrangeable' || variant === 'rearrangeableMulti'
        ? <RearrangeableListbox data={data} options={options} onChange={setData} onEvent={handleEvent} />
        : <Listbox data={data} options={options} onEvent={handleEvent} />

  return {
    key: 'listbox',
    label: 'Listbox',
    keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
    sourceNames: ['Listbox.tsx', 'RearrangeableListbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderListboxInspect(data),
    variants: <VariantListbox value={variant} items={listboxVariantItems} label="listbox variants" idPrefix="listbox-variant" onChange={(next) => {
      setVariant(next)
      setData(initialByVariant[next])
    }} />,
    preview,
    reset: () => setData(initialByVariant[variant]),
  }
}

function useGridDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<GridVariantKey>('dataTransactions')
  const [data, setData] = useState(gridVariants.dataTransactions.data)
  return {
    key: 'grid',
    label: 'Grid',
    keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Ctrl+Home', 'Ctrl+End', 'PageUp', 'PageDown', 'Enter', 'F2', 'Escape'],
    sourceNames: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderGridInspect(data),
    variants: <GridVariantMenu value={variant} onChange={(next) => {
      setVariant(next)
      setData(gridVariants[next].data)
    }} />,
    preview: <Grid data={data} options={{ focusStrategy: 'rovingTabIndex', selectionMode: (data.state as { multiselectable?: boolean } | undefined)?.multiselectable ? 'multiple' : 'single' }} onEvent={(event) => {
      onEvent(event)
      if (event.type === 'extension' && event.name === 'gridSort' && event.key) {
        const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
        setData((current) => ({ ...current, state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key as string]: next } } }))
        return
      }
      setData((current) => reducePatternData(gridDefinition, current, event))
    }} />,
    reset: () => setData(gridVariants[variant].data),
  }
}
