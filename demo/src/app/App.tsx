import { useReducer } from 'react'
import { z } from 'zod'
import type { PatternEvent } from '../../../src'
import { PatternMenu } from './PatternMenu'
import { type PatternKey, useDemoPatterns } from '../shared/demoPatterns'
import { sources, type SourceName } from '../shared/sources'
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

const AppStateSchema = z.object({
  patternKey: z.string(),
  events: z.array(z.custom<PatternEvent>()),
  sourceName: z.string(),
  rightMode: z.enum(rightModes),
  previewMode: z.enum(previewModes),
}).strict()

type AppState = z.infer<typeof AppStateSchema>

type AppAction =
  | { type: 'selectPattern'; patternKey: PatternKey }
  | { type: 'recordEvent'; event: PatternEvent }
  | { type: 'selectSource'; sourceName: SourceName }
  | { type: 'selectRightMode'; rightMode: AppState['rightMode'] }
  | { type: 'selectPreviewMode'; previewMode: AppState['previewMode'] }

const initialAppState = AppStateSchema.parse({
  patternKey: 'treeview',
  events: [],
  sourceName: 'Tree.tsx',
  rightMode: 'source',
  previewMode: 'preview',
})

const reduceAppState = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'selectPattern') return AppStateSchema.parse({ ...state, patternKey: action.patternKey, previewMode: 'preview' })
  if (action.type === 'recordEvent') return AppStateSchema.parse({ ...state, events: [action.event, ...state.events].slice(0, 12) })
  if (action.type === 'selectSource') return AppStateSchema.parse({ ...state, sourceName: action.sourceName })
  if (action.type === 'selectRightMode') return AppStateSchema.parse({ ...state, rightMode: action.rightMode })
  return AppStateSchema.parse({ ...state, previewMode: action.previewMode })
}

export function App() {
  const [state, dispatch] = useReducer(reduceAppState, initialAppState)
  const demos = useDemoPatterns((event) => dispatch({ type: 'recordEvent', event }))
  const activeDemo = demos.find((demo) => demo.key === state.patternKey) ?? demos[0]
  const sourceNames = activeDemo.sourceNames
  const activeSourceName = sourceNames.includes(state.sourceName as SourceName) ? state.sourceName as SourceName : sourceNames[0]
  const source = sources[activeSourceName]
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const availablePreviewModes = activeDemo.variants ? previewModes : previewModes.slice(0, 1)
  const activePreviewMode = activeDemo.variants ? state.previewMode : 'preview'
  const previewModeTabs = useSourceTabs({ label: 'preview panel', tabs: availablePreviewModes, value: activePreviewMode, onChange: (previewMode) => dispatch({ type: 'selectPreviewMode', previewMode }) })
  const eventLog = state.events.map((event) => JSON.stringify(event)).join('\n') || 'none'

  return (
    <main className="grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)_minmax(260px,40vh)] gap-8 bg-white px-6 py-5 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 lg:grid-cols-[180px_minmax(360px,1fr)_minmax(380px,0.9fr)] lg:grid-rows-[minmax(0,1fr)]">
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h1 className={titleClass}>patterns</h1>
        </header>
        <PatternMenu value={state.patternKey} onChange={(patternKey) => dispatch({ type: 'selectPattern', patternKey })} />
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
            {state.rightMode === 'source' ? (
              <div className="grid gap-1">
                <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
                <div className="truncate px-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                  {state.patternKey} / {activeSourceName}
                </div>
              </div>
            ) : null}
            {state.rightMode === 'inspect' ? activeDemo.inspectControls : null}
          </div>
        </header>
        {state.rightMode === 'source' ? (
          <pre {...sourceTabs.getPanelProps()} className={`${preClass} select-text cursor-text`}>
            {source}
          </pre>
        ) : null}
        {state.rightMode === 'inspect' ? <pre className={preClass}>{activeDemo.inspect}</pre> : null}
        {state.rightMode === 'log' ? <pre className={preClass}>{eventLog}</pre> : null}
      </section>
    </main>
  )
}
