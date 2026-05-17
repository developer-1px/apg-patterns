import { useMemo, useReducer, useState } from 'react'
import { reducePatternData, type PatternEvent, type PatternOptions } from '../../src'
import { initialData, reduceData, resolveTarget } from './demoData'
import { Grid } from './Grid'
import { gridDefinition, listboxDefinition } from '../../src'
import { gridVariantItems, gridVariants, type GridVariantKey } from './gridData'
import { renderAriaTree, renderGridInspect, renderHtmlTree, renderListboxInspect, renderStaticInspect } from './inspect'
import { Listbox } from './Listbox'
import { initialListboxData } from './listboxData'
import { PatternMenu } from './PatternMenu'
import { patternItems, type PatternKey } from './patterns'
import { sources } from './sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'
import { Tree } from './Tree'

const panelClass = 'min-h-0 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950'
const headerClass = 'mb-3 flex items-center justify-between gap-3'
const titleClass = 'text-sm font-medium text-zinc-800 dark:text-zinc-200'
const buttonClass = 'h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900'
const selectClass = 'h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
const preClass = 'h-full min-h-0 overflow-auto rounded-md border border-zinc-200 bg-white p-2.5 font-mono text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300'
const optionButtonClass =
  'h-7 rounded-md border border-zinc-200 bg-white px-2 text-left text-xs text-zinc-700 hover:bg-zinc-50 aria-selected:border-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:aria-selected:border-zinc-700 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50'

export function App() {
  const [patternKey, setPatternKey] = useState<PatternKey>('treeview')
  const [data, dispatch] = useReducer(reduceData, initialData)
  const [gridVariant, setGridVariant] = useState<GridVariantKey>('dataTransactions')
  const [gridData, setGridData] = useState(gridVariants.dataTransactions.data)
  const [listboxData, dispatchListbox] = useReducer((current: typeof initialListboxData, event: PatternEvent | { type: 'reset' }) => {
    if (event.type === 'reset') return initialListboxData
    return reducePatternData(listboxDefinition, current, event)
  }, initialListboxData)
  const [events, setEvents] = useState<PatternEvent[]>([])
  const [followFocus, setFollowFocus] = useState(false)
  const [focusStrategy, setFocusStrategy] = useState<'rovingTabIndex' | 'ariaActiveDescendant'>('rovingTabIndex')
  const [itemClickAction, setItemClickAction] = useState<'select' | 'toggleExpand' | 'none'>('select')
  const [sourceName, setSourceName] = useState<keyof typeof sources>('Tree React')
  const [inspectMode, setInspectMode] = useState<'aria' | 'html'>('aria')
  const [rightMode, setRightMode] = useState<'source' | 'inspect' | 'log'>('source')

  const options = useMemo<PatternOptions>(
    () => ({ focusStrategy, followFocus, itemClickAction, indicatorClickAction: 'toggleExpand' }),
    [focusStrategy, followFocus, itemClickAction],
  )

  const handlePatternEvent = (event: PatternEvent) => {
    setEvents((current) => [event, ...current].slice(0, 12))
    if (event.type === 'navigate') {
      const target = resolveTarget(event.direction, data)
      if (target) {
        dispatch({ type: 'focus', key: target })
        if (followFocus) dispatch({ type: 'select', keys: [target], anchorKey: target, extentKey: target })
      }
      return
    }
    dispatch(event)
  }

  const handleGridEvent = (event: PatternEvent) => {
    setEvents((current) => [event, ...current].slice(0, 12))
    setGridData((current) => reducePatternData(gridDefinition, current, event))
  }

  const handleListboxEvent = (event: PatternEvent) => {
    setEvents((current) => [event, ...current].slice(0, 12))
    dispatchListbox(event)
  }

  const selectGridVariant = (variant: GridVariantKey) => {
    setGridVariant(variant)
    setGridData(gridVariants[variant].data)
  }

  const source = sources[sourceName]
  const sourceNames = Object.keys(sources) as (keyof typeof sources)[]
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: sourceName, onChange: setSourceName })
  const treeInspectText = inspectMode === 'aria' ? renderAriaTree(data, options) : renderHtmlTree(data, options)
  const activePatternLabel = patternItems.find((item) => item.key === patternKey)?.label ?? patternKey
  const activeInspectText =
    patternKey === 'treeview'
      ? treeInspectText
      : patternKey === 'grid'
        ? renderGridInspect(gridData)
        : patternKey === 'listbox'
          ? renderListboxInspect(listboxData)
          : renderStaticInspect(patternKey)
  const eventLog = events.map((event) => JSON.stringify(event)).join('\n') || 'none'

  return (
    <main className="grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)_minmax(260px,40vh)] gap-3 bg-white p-3 dark:bg-zinc-950 lg:grid-cols-[240px_minmax(360px,1fr)_minmax(380px,0.95fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h1 className={titleClass}>patterns</h1>
        </header>
        <PatternMenu value={patternKey} onChange={setPatternKey} />
        <div className="mt-5 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <h2 className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">variants</h2>
          {patternKey === 'treeview' ? (
            <div className="grid gap-3 text-xs text-zinc-700 dark:text-zinc-300">
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
          ) : null}
          {patternKey === 'grid' ? (
            <div className="grid gap-1" role="listbox" aria-label="grid variants">
              {gridVariantItems.map((variant) => (
                <button key={variant.key} type="button" role="option" aria-selected={gridVariant === variant.key} className={optionButtonClass} onClick={() => selectGridVariant(variant.key)}>
                  {variant.label}
                </button>
              ))}
            </div>
          ) : null}
          {patternKey === 'listbox' ? <p className="text-xs text-zinc-500 dark:text-zinc-500">single selection</p> : null}
        </div>
      </section>

      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h2 className={titleClass}>{activePatternLabel}</h2>
          <button
            type="button"
            className={buttonClass}
            onClick={() => (patternKey === 'grid' ? setGridData(gridVariants[gridVariant].data) : patternKey === 'listbox' ? dispatchListbox({ type: 'reset' }) : dispatch({ type: 'reset' }))}
          >
            reset
          </button>
        </header>
        {patternKey === 'treeview' ? <Tree data={data} options={options} onEvent={handlePatternEvent} /> : null}
        {patternKey === 'listbox' ? <Listbox data={listboxData} options={{ focusStrategy: 'rovingTabIndex', selectionMode: 'single' }} onEvent={handleListboxEvent} /> : null}
        {patternKey === 'grid' ? <Grid data={gridData} options={{ focusStrategy: 'rovingTabIndex', selectionMode: 'single' }} onEvent={handleGridEvent} /> : null}
      </section>

      <section className={`${panelClass} flex min-h-0 flex-col`}>
        <header className={headerClass}>
          <div className="flex items-center gap-1" role="tablist" aria-label="right panel">
            {(['source', 'inspect', 'log'] as const).map((mode) => (
              <button key={mode} type="button" role="tab" aria-selected={rightMode === mode} className={optionButtonClass} onClick={() => setRightMode(mode)}>
                {mode}
              </button>
            ))}
          </div>
          {rightMode === 'source' ? <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} /> : null}
          {rightMode === 'inspect' && patternKey === 'treeview' ? (
            <select className={selectClass} value={inspectMode} onChange={(event) => setInspectMode(event.currentTarget.value as typeof inspectMode)}>
              <option value="aria">aria</option>
              <option value="html">html</option>
            </select>
          ) : null}
        </header>
        {rightMode === 'source' ? (
          <pre {...sourceTabs.getPanelProps()} className={`${preClass} select-text cursor-text`}>
            {source}
          </pre>
        ) : null}
        {rightMode === 'inspect' ? <pre className={preClass}>{activeInspectText}</pre> : null}
        {rightMode === 'log' ? <pre className={preClass}>{eventLog}</pre> : null}
      </section>
    </main>
  )
}
