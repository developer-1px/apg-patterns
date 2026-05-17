import { useState } from 'react'
import type { PatternEvent } from '../../src'
import { PatternMenu } from './PatternMenu'
import { type PatternKey, useDemoPatterns } from './demoPatterns'
import { sources, type SourceName } from './sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'

const panelClass = 'min-h-0 bg-white p-1 dark:bg-zinc-950'
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const titleClass = 'text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500'
const buttonClass = 'h-7 rounded px-2 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
const preClass = 'h-full min-h-0 overflow-auto bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300'
const optionButtonClass =
  'h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950'
const rightModes = ['source', 'inspect', 'log'] as const
const previewModes = ['preview', 'variants'] as const

export function App() {
  const [patternKey, setPatternKey] = useState<PatternKey>('treeview')
  const [events, setEvents] = useState<PatternEvent[]>([])
  const [sourceName, setSourceName] = useState<SourceName>('Tree.tsx')
  const [rightMode, setRightMode] = useState<'source' | 'inspect' | 'log'>('source')
  const [previewMode, setPreviewMode] = useState<'preview' | 'variants'>('preview')

  const demos = useDemoPatterns((event) => setEvents((current) => [event, ...current].slice(0, 12)))
  const activeDemo = demos.find((demo) => demo.key === patternKey) ?? demos[0]
  const sourceNames = activeDemo.sourceNames
  const activeSourceName = sourceNames.includes(sourceName) ? sourceName : sourceNames[0]
  const source = sources[activeSourceName]
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: setSourceName })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: rightMode, onChange: setRightMode })
  const availablePreviewModes = activeDemo.variants ? previewModes : previewModes.slice(0, 1)
  const activePreviewMode = activeDemo.variants ? previewMode : 'preview'
  const previewModeTabs = useSourceTabs({ label: 'preview panel', tabs: availablePreviewModes, value: activePreviewMode, onChange: setPreviewMode })
  const eventLog = events.map((event) => JSON.stringify(event)).join('\n') || 'none'

  return (
    <main className="grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)_minmax(260px,40vh)] gap-8 bg-white px-6 py-5 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 lg:grid-cols-[180px_minmax(360px,1fr)_minmax(380px,0.9fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h1 className={titleClass}>patterns</h1>
        </header>
        <PatternMenu value={patternKey} onChange={setPatternKey} />
      </section>

      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h2 className={titleClass}>{activeDemo.label}</h2>
          <div className="flex items-center gap-1">
            {activeDemo.variants ? (
              <div {...previewModeTabs.getTablistProps()} className="flex items-center gap-1">
                {availablePreviewModes.map((mode) => (
                  <button {...previewModeTabs.getTabProps(mode)} key={mode} type="button" className={optionButtonClass}>
                    {mode}
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" className={buttonClass} onClick={activeDemo.reset}>
              reset
            </button>
          </div>
        </header>
        {activePreviewMode === 'preview' ? (
          <div {...previewModeTabs.getPanelProps()}>
            <div className="mb-4 flex flex-wrap gap-1">
              {activeDemo.keyboardShortcuts.map((shortcut) => (
                <kbd key={shortcut} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {shortcut}
                </kbd>
              ))}
            </div>
            {activeDemo.preview}
          </div>
        ) : null}
        {activePreviewMode === 'variants' ? (
          <div {...previewModeTabs.getPanelProps()}>{activeDemo.variants}</div>
        ) : null}
      </section>

      <section className={`${panelClass} flex min-h-0 flex-col`}>
        <header className="mb-3 grid gap-2">
          <div {...rightModeTabs.getTablistProps()} className="flex items-center gap-1">
            {rightModes.map((mode) => (
              <button {...rightModeTabs.getTabProps(mode)} key={mode} type="button" className={optionButtonClass}>
                {mode}
              </button>
            ))}
          </div>
          <div className="min-w-0">
            {rightMode === 'source' ? (
              <div className="grid gap-1">
                <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
                <div className="truncate px-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                  {patternKey} / {activeSourceName}
                </div>
              </div>
            ) : null}
            {rightMode === 'inspect' ? activeDemo.inspectControls : null}
          </div>
        </header>
        {rightMode === 'source' ? (
          <pre {...sourceTabs.getPanelProps()} className={`${preClass} select-text cursor-text`}>
            {source}
          </pre>
        ) : null}
        {rightMode === 'inspect' ? <pre className={preClass}>{activeDemo.inspect}</pre> : null}
        {rightMode === 'log' ? <pre className={preClass}>{eventLog}</pre> : null}
      </section>
    </main>
  )
}
