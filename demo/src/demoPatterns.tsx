import type { ReactNode } from 'react'
import { useMemo, useReducer, useState } from 'react'
import { gridDefinition, listboxDefinition, menubarDefinition, menuButtonDefinition, reduceDisclosureData, reducePatternData, reduceTabsData, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { Checkbox } from './Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from './checkboxData'
import { Disclosure } from './Disclosure'
import {
  initialDisclosureData,
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'
import { initialData, reduceData, resolveTarget } from './demoData'
import { treeVariants, type TreeVariantKey } from './treeVariants'
import { TreeVariantMenu } from './TreeVariantMenu'
import { Grid } from './Grid'
import { gridVariants, type GridVariantKey } from './gridData'
import { GridVariantMenu } from './GridVariantMenu'
import { renderAriaTree, renderCheckboxInspect, renderComboboxInspect, renderDisclosureInspect, renderGridInspect, renderHtmlTree, renderListboxInspect, renderMenuInspect, renderRadioInspect, renderSliderInspect, renderTabsInspect } from './inspect'
import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'
import { Slider } from './Slider'
import { initialSliderData, reduceSliderData, sliderOptions, sliderVariantItems, sliderVariants, type SliderVariantKey } from './sliderData'
import { RadioGroup } from './RadioGroup'
import { initialRadioData, reduceRadioData } from './radioData'
import type { SourceName } from './sources'
import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { Tree } from './Tree'

const selectClass = 'h-7 rounded bg-zinc-50 px-2 text-xs text-zinc-700 outline-none focus:bg-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:bg-zinc-950'

export type PatternKey = 'treeview' | 'listbox' | 'grid' | 'tabs' | 'slider' | 'disclosure' | 'checkbox' | 'radio' | 'menu' | 'combobox'

export type ListboxVariantKey = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'
const listboxVariantItems: readonly { key: ListboxVariantKey; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'scrollable', label: 'Scrollable' },
  { key: 'grouped', label: 'Grouped' },
  { key: 'rearrangeable', label: 'Rearrangeable (single-select)' },
  { key: 'rearrangeableMulti', label: 'Rearrangeable (multi-select)' },
]

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
  { key: 'radio', label: 'Radio Group' },
  { key: 'menu', label: 'Menu / Menubar' },
  { key: 'combobox', label: 'Combobox' },
]

export function useDemoPatterns(onEvent: (event: PatternEvent) => void): readonly DemoPattern[] {
  const [treeVariant, setTreeVariant] = useState<TreeVariantKey>('fileDirectoryComputed')
  const [treeData, setTreeData] = useState<PatternData>(treeVariants.fileDirectoryComputed.data)
  const selectTreeVariant = (variant: TreeVariantKey) => {
    setTreeVariant(variant)
    setTreeData(treeVariants[variant].data)
  }
  const dispatchTree = (event: PatternEvent | { type: 'reset' }) => {
    if (event.type === 'reset') {
      setTreeData(treeVariants[treeVariant].data)
      return
    }
    setTreeData((current) => reduceData(current, event))
  }
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

  const listboxVariantInitial: Record<ListboxVariantKey, PatternData> = {
    basic: initialListboxData,
    scrollable: initialScrollableListboxData,
    grouped: initialGroupedListboxData,
    rearrangeable: initialRearrangeableListboxData,
    rearrangeableMulti: initialRearrangeableListboxData,
  }
  const [listboxVariant, setListboxVariant] = useState<ListboxVariantKey>('basic')
  const [listboxData, setListboxData] = useState<PatternData>(initialListboxData)
  const selectListboxVariant = (variant: ListboxVariantKey) => {
    setListboxVariant(variant)
    setListboxData(listboxVariantInitial[variant])
  }
  const listboxOptions: PatternOptions =
    listboxVariant === 'rearrangeableMulti'
      ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
      : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
  const handleListboxEvent = (event: PatternEvent) => {
    onEvent(event)
    setListboxData((current) => reducePatternData(listboxDefinition, current, event))
  }

  const [gridVariant, setGridVariant] = useState<GridVariantKey>('dataTransactions')
  const [gridData, setGridData] = useState(gridVariants.dataTransactions.data)
  const selectGridVariant = (variant: GridVariantKey) => {
    setGridVariant(variant)
    setGridData(gridVariants[variant].data)
  }

  const [tabsVariant, setTabsVariant] = useState<TabsVariantKey>(initialTabsVariant)
  const [tabsData, setTabsData] = useState<PatternData>(tabsVariants[initialTabsVariant].data)
  const activeTabsVariant = tabsVariants[tabsVariant]
  const selectTabsVariant = (variant: TabsVariantKey) => {
    setTabsVariant(variant)
    setTabsData(tabsVariants[variant].data)
  }
  const handleTabsDataChange = (nextData: PatternData, event: PatternEvent) => {
    const activeKey = nextData.state?.activeKey
    if (event.type === 'navigate' && activeKey && activeTabsVariant.options.activationMode === 'automatic') {
      setTabsData(reduceTabsData(nextData, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
      return
    }
    setTabsData(nextData)
  }
  const handleTabsEvent = (event: PatternEvent) => {
    onEvent(event)
    if (event.type === 'extension' && event.name === 'closeTab' && event.key) {
      setTabsData((current) => closeTabInData(current, event.key as string))
    }
  }

  const [sliderVariant, setSliderVariant] = useState<SliderVariantKey>('color')
  const [sliderData, setSliderData] = useState(sliderVariants.color.data)
  const activeSliderOptions = sliderVariants[sliderVariant].options
  const selectSliderVariant = (variant: SliderVariantKey) => {
    setSliderVariant(variant)
    setSliderData(sliderVariants[variant].data)
  }
  void initialSliderData
  void sliderOptions
  const disclosureVariants: Record<DisclosureVariantKey, PatternData> = {
    simple: initialDisclosureData,
    image: initialImageDisclosureData,
    faq: initialFaqDisclosureData,
    navMenu: initialNavMenuDisclosureData,
    navMenuTopLinks: initialNavMenuTopLinksDisclosureData,
  }
  const [disclosureVariant, setDisclosureVariant] = useState<DisclosureVariantKey>('simple')
  const [disclosureData, setDisclosureData] = useState<PatternData>(initialDisclosureData)
  const selectDisclosureVariant = (variant: DisclosureVariantKey) => {
    setDisclosureVariant(variant)
    setDisclosureData(disclosureVariants[variant])
  }
  const [checkboxVariant, setCheckboxVariant] = useState<CheckboxVariantKey>('twoState')
  const [checkboxData, setCheckboxData] = useState(checkboxVariants.twoState.data)
  const [radioData, setRadioData] = useState(initialRadioData)

  // ── Combobox ───────────────────────────────────────────────────────────────
  const [comboboxVariant, setComboboxVariant] = useState<ComboboxVariantKey>('autocompleteList')
  const [comboboxData, setComboboxData] = useState<PatternData>(buildComboboxData())
  const selectComboboxVariant = (variant: ComboboxVariantKey) => {
    setComboboxVariant(variant)
    setComboboxData(buildComboboxData())
  }

  // ── Menu / Menubar ─────────────────────────────────────────────────────────
  const [menuVariant, setMenuVariant] = useState<MenuVariantKey>('editorMenubar')
  const [menuData, setMenuData] = useState<PatternData>(menuVariants.editorMenubar.data)
  const selectMenuVariant = (variant: MenuVariantKey) => {
    setMenuVariant(variant)
    setMenuData(menuVariants[variant].data)
  }
  const menuFlavor = menuVariants[menuVariant].flavor
  const menuFocusStrategy = menuVariants[menuVariant].focusStrategy
  const menuDefinition = menuFlavor === 'menubar' ? menubarDefinition : menuButtonDefinition
  const selectCheckboxVariant = (variant: CheckboxVariantKey) => {
    setCheckboxVariant(variant)
    setCheckboxData(checkboxVariants[variant].data)
  }

  return [
    {
      key: 'treeview',
      label: 'Treeview',
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
          <TreeVariantMenu value={treeVariant} onChange={selectTreeVariant} />
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
      sourceNames: ['Listbox.tsx', 'RearrangeableListbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderListboxInspect(listboxData),
      variants: (
        <select
          className={selectClass}
          value={listboxVariant}
          onChange={(event) => selectListboxVariant(event.currentTarget.value as ListboxVariantKey)}
        >
          {listboxVariantItems.map((variant) => (
            <option key={variant.key} value={variant.key}>{variant.label}</option>
          ))}
        </select>
      ),
      preview: (() => {
        switch (listboxVariant) {
          case 'scrollable':
            return <Listbox data={listboxData} options={listboxOptions} scrollable onEvent={handleListboxEvent} />
          case 'grouped':
            return <Listbox data={listboxData} options={listboxOptions} groups={groupedListboxStructure} onEvent={handleListboxEvent} />
          case 'rearrangeable':
          case 'rearrangeableMulti':
            return (
              <RearrangeableListbox
                data={listboxData}
                options={listboxOptions}
                onChange={setListboxData}
                onEvent={handleListboxEvent}
              />
            )
          default:
            return <Listbox data={listboxData} options={listboxOptions} onEvent={handleListboxEvent} />
        }
      })(),
      reset: () => setListboxData(listboxVariantInitial[listboxVariant]),
    },
    {
      key: 'grid',
      label: 'Grid',
      sourceNames: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderGridInspect(gridData),
      variants: <GridVariantMenu value={gridVariant} onChange={selectGridVariant} />,
      preview: <Grid data={gridData} options={{ focusStrategy: 'rovingTabIndex', selectionMode: (gridData.state as { multiselectable?: boolean } | undefined)?.multiselectable ? 'multiple' : 'single' }} onEvent={(event) => {
        onEvent(event)
        if (event.type === 'extension' && event.name === 'gridSort' && event.key) {
          const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
          setGridData((current) => ({
            ...current,
            state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key as string]: next } },
          }))
          return
        }
        setGridData((current) => reducePatternData(gridDefinition, current, event))
      }} />,
      reset: () => setGridData(gridVariants[gridVariant].data),
    },
    {
      key: 'tabs',
      label: 'Tabs',
      sourceNames: ['Tabs.tsx', 'tabsData.ts', 'react.ts', 'tabs/runtime.ts', 'tabs/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderTabsInspect(tabsData),
      variants: (
        <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          variant
          <select
            className={selectClass}
            value={tabsVariant}
            onChange={(event) => selectTabsVariant(event.currentTarget.value as TabsVariantKey)}
          >
            {tabsVariantItems.map((variant) => (
              <option key={variant.key} value={variant.key}>{variant.label}</option>
            ))}
          </select>
        </label>
      ),
      preview: (
        <Tabs
          data={tabsData}
          options={activeTabsVariant.options}
          variantLabel={activeTabsVariant.label}
          hint={activeTabsVariant.hint}
          onEvent={handleTabsEvent}
          onDataChange={handleTabsDataChange}
        />
      ),
      reset: () => setTabsData(activeTabsVariant.data),
    },
    {
      key: 'slider',
      label: 'Slider',
      sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderSliderInspect(sliderData),
      variants: (
        <select
          className={selectClass}
          value={sliderVariant}
          onChange={(event) => selectSliderVariant(event.currentTarget.value as SliderVariantKey)}
        >
          {sliderVariantItems.map((variant) => (
            <option key={variant.key} value={variant.key}>{variant.label}</option>
          ))}
        </select>
      ),
      preview: <Slider data={sliderData} options={activeSliderOptions} onEvent={(event) => {
        onEvent(event)
        setSliderData((current) => reduceSliderData(current, event, activeSliderOptions))
      }} />,
      reset: () => setSliderData(sliderVariants[sliderVariant].data),
    },
    {
      key: 'disclosure',
      label: 'Disclosure',
      sourceNames: ['Disclosure.tsx', 'disclosureData.ts', 'disclosure/runtime.ts', 'disclosure/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDisclosureInspect(disclosureData),
      variants: (
        <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
          variant
          <select
            className={selectClass}
            value={disclosureVariant}
            onChange={(event) => selectDisclosureVariant(event.currentTarget.value as DisclosureVariantKey)}
          >
            <option value="simple">simple</option>
            <option value="image">image description</option>
            <option value="faq">FAQ</option>
            <option value="navMenu">navigation menu</option>
            <option value="navMenuTopLinks">navigation menu (top-level links)</option>
          </select>
        </label>
      ),
      preview: <Disclosure data={disclosureData} variant={disclosureVariant} onEvent={(event) => {
        onEvent(event)
        setDisclosureData((current) => reduceDisclosureData(current, event))
      }} />,
      reset: () => setDisclosureData(disclosureVariants[disclosureVariant]),
    },
    {
      key: 'checkbox',
      label: 'Checkbox',
      sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderCheckboxInspect(checkboxData),
      variants: (
        <select
          className={selectClass}
          value={checkboxVariant}
          onChange={(event) => selectCheckboxVariant(event.currentTarget.value as CheckboxVariantKey)}
        >
          {checkboxVariantItems.map((variant) => (
            <option key={variant.key} value={variant.key}>{variant.label}</option>
          ))}
        </select>
      ),
      preview: <Checkbox data={checkboxData} groupLabel={checkboxVariants[checkboxVariant].groupLabel} onEvent={(event) => {
        onEvent(event)
        setCheckboxData((current) => checkboxVariants[checkboxVariant].reduce(current, event))
      }} />,
      reset: () => setCheckboxData(checkboxVariants[checkboxVariant].data),
    },
    {
      key: 'radio',
      label: 'Radio Group',
      sourceNames: ['RadioGroup.tsx', 'radioData.ts', 'radio/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderRadioInspect(radioData),
      preview: <RadioGroup data={radioData} onEvent={(event) => {
        onEvent(event)
        setRadioData((current) => reduceRadioData(current, event))
      }} />,
      reset: () => setRadioData(initialRadioData),
    },
    {
      key: 'menu',
      label: 'Menu / Menubar',
      sourceNames: ['Menu.tsx', 'menuData.ts', 'menu/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderMenuInspect(menuData, menuFlavor, menuFocusStrategy),
      variants: (
        <div className="grid gap-1">
          {menuVariantItems.map((variant) => (
            <button
              key={variant.key}
              type="button"
              onClick={() => selectMenuVariant(variant.key)}
              aria-pressed={menuVariant === variant.key}
              className="h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-950"
            >
              {variant.label}
            </button>
          ))}
        </div>
      ),
      preview: (
        <Menu
          key={menuVariant}
          data={menuData}
          flavor={menuFlavor}
          focusStrategy={menuFocusStrategy}
          onEvent={(event) => {
            onEvent(event)
            setMenuData((current) => reducePatternData(menuDefinition, current, event))
          }}
        />
      ),
      reset: () => setMenuData(menuVariants[menuVariant].data),
    },
    {
      key: 'combobox',
      label: 'Combobox',
      sourceNames: ['Combobox.tsx', 'comboboxData.ts', 'combobox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderComboboxInspect(comboboxData, { autocomplete: comboboxVariants[comboboxVariant].autocomplete }),
      variants: (
        <select
          className={selectClass}
          value={comboboxVariant}
          onChange={(event) => selectComboboxVariant(event.currentTarget.value as ComboboxVariantKey)}
        >
          {(Object.keys(comboboxVariants) as ComboboxVariantKey[]).map((key) => (
            <option key={key} value={key}>{comboboxVariants[key].label}</option>
          ))}
        </select>
      ),
      preview: (
        <Combobox
          data={comboboxData}
          variant={comboboxVariant}
          onEvent={(event) => {
            onEvent(event)
            setComboboxData((current) => reduceComboboxData(current, event))
          }}
          onVisibleKeysChange={(keys) => setComboboxData(() => {
            const next = buildComboboxData(keys)
            return { ...next, state: { ...next.state, expandedKeys: ['combobox'] } }
          })}
        />
      ),
      reset: () => setComboboxData(buildComboboxData()),
    },
  ]
}
