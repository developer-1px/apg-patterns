import type { ReactNode } from 'react'
import { useMemo, useReducer, useState } from 'react'
import { gridDefinition, listboxDefinition, reduceDisclosureData, reducePatternData, reduceTabsData, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { Checkbox } from './Checkbox'
import { initialCheckboxData, reduceCheckboxData } from './checkboxData'
import { Disclosure } from './Disclosure'
import { initialDisclosureData } from './disclosureData'
import { initialData, reduceData, resolveTarget } from './demoData'
import { Grid } from './Grid'
import { gridVariants, type GridVariantKey } from './gridData'
import { GridVariantMenu } from './GridVariantMenu'
import { renderAriaTree, renderCheckboxInspect, renderDisclosureInspect, renderGridInspect, renderHtmlTree, renderListboxInspect, renderSliderInspect, renderTabsInspect } from './inspect'
import { Listbox } from './Listbox'
import { initialListboxData } from './listboxData'
import { Slider } from './Slider'
import { initialSliderData, reduceSliderData, sliderOptions } from './sliderData'
import type { SourceName } from './sources'
import { Tabs } from './Tabs'
import { initialTabsData } from './tabsData'
import { Tree } from './Tree'

const selectClass = 'h-7 rounded bg-zinc-50 px-2 text-xs text-zinc-700 outline-none focus:bg-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:bg-zinc-950'

export type PatternKey = 'treeview' | 'listbox' | 'grid' | 'tabs' | 'slider' | 'disclosure' | 'checkbox'

export interface DemoPattern {
  key: PatternKey
  label: string
  sourceNames: readonly SourceName[]
  inspect: string
  preview: ReactNode
  reset: () => void
  variants?: ReactNode
  inspectControls?: ReactNode
}

export const patternItems: readonly { key: PatternKey; label: string }[] = [
  { key: 'treeview', label: 'Treeview' },
  { key: 'listbox', label: 'Listbox' },
  { key: 'grid', label: 'Grid' },
  { key: 'tabs', label: 'Tabs' },
  { key: 'slider', label: 'Slider' },
  { key: 'disclosure', label: 'Disclosure' },
  { key: 'checkbox', label: 'Checkbox' },
]

export function useDemoPatterns(onEvent: (event: PatternEvent) => void): readonly DemoPattern[] {
  const [treeData, dispatchTree] = useReducer(reduceData, initialData)
  const [followFocus, setFollowFocus] = useState(false)
  const [focusStrategy, setFocusStrategy] = useState<'rovingTabIndex' | 'ariaActiveDescendant'>('rovingTabIndex')
  const [itemClickAction, setItemClickAction] = useState<'select' | 'toggleExpand' | 'none'>('select')
  const [inspectMode, setInspectMode] = useState<'aria' | 'html'>('aria')
  const treeOptions = useMemo<PatternOptions>(
    () => ({ focusStrategy, followFocus, itemClickAction, indicatorClickAction: 'toggleExpand' }),
    [focusStrategy, followFocus, itemClickAction],
  )
  const handleTreeEvent = (event: PatternEvent) => {
    onEvent(event)
    if (event.type === 'navigate') {
      const target = resolveTarget(event.direction, treeData)
      if (target) {
        dispatchTree({ type: 'focus', key: target })
        if (followFocus) dispatchTree({ type: 'select', keys: [target], anchorKey: target, extentKey: target })
      }
      return
    }
    dispatchTree(event)
  }

  const [listboxData, dispatchListbox] = useReducer((current: typeof initialListboxData, event: PatternEvent | { type: 'reset' }) => {
    if (event.type === 'reset') return initialListboxData
    return reducePatternData(listboxDefinition, current, event)
  }, initialListboxData)

  const [gridVariant, setGridVariant] = useState<GridVariantKey>('dataTransactions')
  const [gridData, setGridData] = useState(gridVariants.dataTransactions.data)
  const selectGridVariant = (variant: GridVariantKey) => {
    setGridVariant(variant)
    setGridData(gridVariants[variant].data)
  }

  const [tabsData, setTabsData] = useState(initialTabsData)
  const handleTabsDataChange = (nextData: PatternData, event: PatternEvent) => {
    const activeKey = nextData.state?.activeKey
    setTabsData(event.type === 'navigate' && activeKey ? reduceTabsData(nextData, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }) : nextData)
  }

  const [sliderData, setSliderData] = useState(initialSliderData)
  const [disclosureData, setDisclosureData] = useState(initialDisclosureData)
  const [checkboxData, setCheckboxData] = useState(initialCheckboxData)

  return [
    {
      key: 'treeview',
      label: 'Treeview',
      sourceNames: ['Tree.tsx', 'useTreeDomFocus.ts', 'react.ts', 'treeview/runtime.ts', 'treeview/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts', 'demoData.ts'],
      inspect: inspectMode === 'aria' ? renderAriaTree(treeData, treeOptions) : renderHtmlTree(treeData, treeOptions),
      inspectControls: (
        <select className={selectClass} value={inspectMode} onChange={(event) => setInspectMode(event.currentTarget.value as typeof inspectMode)}>
          <option value="aria">aria</option>
          <option value="html">html</option>
        </select>
      ),
      variants: (
        <div className="grid gap-3 text-xs text-zinc-600 dark:text-zinc-400">
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
    },
    {
      key: 'listbox',
      label: 'Listbox',
      sourceNames: ['Listbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderListboxInspect(listboxData),
      preview: <Listbox data={listboxData} options={{ focusStrategy: 'rovingTabIndex', selectionMode: 'single' }} onEvent={(event) => {
        onEvent(event)
        dispatchListbox(event)
      }} />,
      reset: () => dispatchListbox({ type: 'reset' }),
    },
    {
      key: 'grid',
      label: 'Grid',
      sourceNames: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderGridInspect(gridData),
      variants: <GridVariantMenu value={gridVariant} onChange={selectGridVariant} />,
      preview: <Grid data={gridData} options={{ focusStrategy: 'rovingTabIndex', selectionMode: 'single' }} onEvent={(event) => {
        onEvent(event)
        setGridData((current) => reducePatternData(gridDefinition, current, event))
      }} />,
      reset: () => setGridData(gridVariants[gridVariant].data),
    },
    {
      key: 'tabs',
      label: 'Tabs',
      sourceNames: ['Tabs.tsx', 'tabsData.ts', 'react.ts', 'tabs/runtime.ts', 'tabs/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderTabsInspect(tabsData),
      preview: <Tabs data={tabsData} onEvent={onEvent} onDataChange={handleTabsDataChange} />,
      reset: () => setTabsData(initialTabsData),
    },
    {
      key: 'slider',
      label: 'Slider',
      sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderSliderInspect(sliderData),
      preview: <Slider data={sliderData} options={sliderOptions} onEvent={(event) => {
        onEvent(event)
        setSliderData((current) => reduceSliderData(current, event, sliderOptions))
      }} />,
      reset: () => setSliderData(initialSliderData),
    },
    {
      key: 'disclosure',
      label: 'Disclosure',
      sourceNames: ['Disclosure.tsx', 'disclosureData.ts', 'disclosure/runtime.ts', 'disclosure/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDisclosureInspect(disclosureData),
      preview: <Disclosure data={disclosureData} onEvent={(event) => {
        onEvent(event)
        setDisclosureData((current) => reduceDisclosureData(current, event))
      }} />,
      reset: () => setDisclosureData(initialDisclosureData),
    },
    {
      key: 'checkbox',
      label: 'Checkbox',
      sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderCheckboxInspect(checkboxData),
      preview: <Checkbox data={checkboxData} onEvent={(event) => {
        onEvent(event)
        setCheckboxData((current) => reduceCheckboxData(current, event))
      }} />,
      reset: () => setCheckboxData(initialCheckboxData),
    },
  ]
}
