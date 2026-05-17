import { useEffect, useReducer, useState } from 'react'
import { z } from 'zod'
import type { PatternEvent } from '../../../src'
import { PatternMenu } from './PatternMenu'
import { patternItems, type PatternKey, useDemoPattern } from '../shared/demoPatterns'
import { Icon, type IconName } from '../shared/Icon'
import { sourceLoaders, type SourceName } from '../shared/sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'

const panelClass = 'min-h-0 bg-white p-1 dark:bg-zinc-950'
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const titleClass = 'text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500'
const buttonClass = 'h-7 rounded px-2 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
const preClass = 'h-full min-h-0 overflow-auto bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300'
const optionButtonClass =
  'h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950'
const rightModes = ['source', 'inspect', 'log'] as const
const rightModeLabels: Record<(typeof rightModes)[number], string> = {
  source: 'code',
  inspect: 'aria',
  log: 'events',
}
const rightModesByLabel = {
  code: 'source',
  aria: 'inspect',
  events: 'log',
} as const satisfies Record<string, (typeof rightModes)[number]>

const AppStateSchema = z.object({
  patternKey: z.string(),
  events: z.array(z.custom<PatternEvent>()),
  sourceName: z.string(),
  rightMode: z.enum(rightModes),
  rightPanelOpen: z.boolean(),
}).strict()

type AppState = z.infer<typeof AppStateSchema>

type AppAction =
  | { type: 'selectPattern'; patternKey: PatternKey }
  | { type: 'recordEvent'; event: PatternEvent }
  | { type: 'clearEvents' }
  | { type: 'selectSource'; sourceName: SourceName }
  | { type: 'selectRightMode'; rightMode: AppState['rightMode'] }
  | { type: 'toggleRightPanel' }
  | { type: 'restoreState'; state: AppState }

const defaultAppState = AppStateSchema.parse({
  patternKey: 'treeview',
  events: [],
  sourceName: 'Tree.tsx',
  rightMode: 'source',
  rightPanelOpen: true,
})

const reduceAppState = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'selectPattern') return AppStateSchema.parse({ ...state, patternKey: action.patternKey, events: [] })
  if (action.type === 'recordEvent') return AppStateSchema.parse({ ...state, events: [action.event, ...state.events].slice(0, 12) })
  if (action.type === 'clearEvents') return AppStateSchema.parse({ ...state, events: [] })
  if (action.type === 'selectSource') return AppStateSchema.parse({ ...state, sourceName: action.sourceName })
  if (action.type === 'selectRightMode') return AppStateSchema.parse({ ...state, rightMode: action.rightMode, rightPanelOpen: true })
  if (action.type === 'restoreState') return action.state
  return AppStateSchema.parse({ ...state, rightPanelOpen: !state.rightPanelOpen })
}

export function App() {
  const [state, dispatch] = useReducer(reduceAppState, defaultAppState, readInitialAppState)

  return (
    <main className={`grid h-dvh grid-cols-1 ${state.rightPanelOpen ? 'grid-rows-[minmax(80px,14dvh)_minmax(280px,1fr)_minmax(260px,34dvh)]' : 'grid-rows-[minmax(80px,16dvh)_minmax(0,1fr)]'} gap-4 bg-white px-4 py-4 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${state.rightPanelOpen ? 'lg:grid-cols-[180px_minmax(360px,1fr)_minmax(380px,0.9fr)]' : 'lg:grid-cols-[180px_minmax(360px,1fr)]'} lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-6 lg:py-5`}>
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h1 className={titleClass}>patterns</h1>
        </header>
        <PatternMenu value={state.patternKey} onChange={(patternKey) => dispatch({ type: 'selectPattern', patternKey })} />
      </section>

      <ActiveDemoWorkspace key={state.patternKey} state={state} dispatch={dispatch} />
    </main>
  )
}

function ActiveDemoWorkspace({
  state,
  dispatch,
}: {
  state: AppState
  dispatch: (action: AppAction) => void
}) {
  const activeDemo = useDemoPattern(state.patternKey, (event) => dispatch({ type: 'recordEvent', event }))
  const sourceNames = activeDemo.sourceNames
  const activeSourceName = sourceNames.includes(state.sourceName as SourceName) ? state.sourceName as SourceName : sourceNames[0]
  const [source, setSource] = useState('loading')
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const eventLog = state.events.map((event) => JSON.stringify(event)).join('\n') || 'none'

  useEffect(() => {
    writeAppHash({
      patternKey: activeDemo.key,
      sourceName: activeSourceName,
      rightMode: state.rightMode,
      rightPanelOpen: state.rightPanelOpen,
    })
  }, [activeDemo.key, activeSourceName, state.rightMode, state.rightPanelOpen])

  useEffect(() => {
    const restoreFromHash = () => dispatch({ type: 'restoreState', state: readInitialAppState(defaultAppState) })
    window.addEventListener('hashchange', restoreFromHash)
    return () => window.removeEventListener('hashchange', restoreFromHash)
  }, [])

  useEffect(() => {
    let cancelled = false
    setSource('loading')
    sourceLoaders[activeSourceName]?.()
      .then((nextSource) => {
        if (!cancelled) setSource(nextSource)
      })
      .catch(() => {
        if (!cancelled) setSource('missing source')
      })
    return () => {
      cancelled = true
    }
  }, [activeSourceName])

  return (
    <>
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h2 className={titleClass}>{activeDemo.label}</h2>
          <div className="flex items-center gap-1">
            <button type="button" className={buttonClass} onClick={activeDemo.reset}>
              reset
            </button>
            <button
              type="button"
              className={`${buttonClass} aria-pressed:bg-zinc-900 aria-pressed:text-white dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-950`}
              aria-pressed={state.rightPanelOpen}
              onClick={() => dispatch({ type: 'toggleRightPanel' })}
              title={state.rightPanelOpen ? 'Hide source panel' : 'Show source panel'}
            >
              code
            </button>
          </div>
        </header>
        {activeDemo.variants ? <div className="mb-3">{activeDemo.variants}</div> : null}
        {activeDemo.keyboardShortcuts.length > 0 ? (
          <div className="mb-4">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-600">keys</div>
            <div className="flex flex-wrap gap-1">
              {activeDemo.keyboardShortcuts.map((shortcut) => (
                <kbd key={shortcut} className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <ShortcutIndicator shortcut={shortcut} />
                </kbd>
              ))}
            </div>
          </div>
        ) : null}
        {activeDemo.preview}
      </section>

      {state.rightPanelOpen ? (
      <section className={`${panelClass} flex min-h-0 flex-col`}>
        <header className="mb-3 grid gap-2">
          <div {...rightModeTabs.getTablistProps()} className="flex items-center gap-1">
            {rightModes.map((mode) => (
              <button {...rightModeTabs.getTabProps(mode)} key={mode} type="button" className={optionButtonClass}>
                {rightModeLabels[mode]}
              </button>
            ))}
          </div>
          <div className="min-w-0">
            {state.rightMode === 'source' ? (
              <div className="grid gap-1">
                <div className="flex min-w-0 items-start gap-2">
                  <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
                  <button type="button" className={`${buttonClass} shrink-0`} onClick={() => copyText(source)}>
                    copy
                  </button>
                </div>
                <div className="truncate px-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-600" title={activeSourceName}>
                  {activeSourceName}
                </div>
              </div>
            ) : null}
            {state.rightMode === 'inspect' ? activeDemo.inspectControls : null}
            {state.rightMode === 'log' ? (
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{state.events.length} events</div>
                <button type="button" className={buttonClass} onClick={() => dispatch({ type: 'clearEvents' })}>
                  clear
                </button>
              </div>
            ) : null}
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
      ) : null}
    </>
  )
}

const shortcutIconByToken: Partial<Record<string, IconName>> = {
  ArrowDown: 'arrow-down',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ArrowUp: 'arrow-up',
}

function ShortcutIndicator({ shortcut }: { shortcut: string }) {
  return (
    <>
      {shortcut.split('+').map((token, index) => {
        const icon = shortcutIconByToken[token]
        return (
          <span key={`${shortcut}-${token}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <Icon name="plus" className="text-[9px] text-zinc-400 dark:text-zinc-600" /> : null}
            {icon ? <Icon name={icon} className="text-xs" /> : <span>{token}</span>}
          </span>
        )
      })}
    </>
  )
}

function readInitialAppState(fallback: AppState): AppState {
  if (typeof window === 'undefined') return fallback
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const patternKey = coercePatternKey(params.get('pattern')) ?? fallback.patternKey
  const rightMode = coerceRightMode(params.get('panel')) ?? fallback.rightMode
  const sourceName = params.get('source') || fallback.sourceName
  const rightPanelOpen = params.get('panel') === 'off' ? false : fallback.rightPanelOpen
  return AppStateSchema.parse({ ...fallback, patternKey, sourceName, rightMode, rightPanelOpen })
}

function writeAppHash({
  patternKey,
  sourceName,
  rightMode,
  rightPanelOpen,
}: Pick<AppState, 'patternKey' | 'sourceName' | 'rightMode' | 'rightPanelOpen'>) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  params.set('pattern', patternKey)
  params.set('panel', rightPanelOpen ? rightModeLabels[rightMode] : 'off')
  params.set('source', sourceName)
  const nextHash = `#${params.toString()}`
  if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash)
}

function coercePatternKey(value: string | null): PatternKey | null {
  if (!value) return null
  return patternItems.some((item) => item.key === value) ? value : null
}

function coerceRightMode(value: string | null): AppState['rightMode'] | null {
  if (!value || value === 'off') return null
  if (value in rightModesByLabel) return rightModesByLabel[value as keyof typeof rightModesByLabel]
  return rightModes.includes(value as AppState['rightMode']) ? value as AppState['rightMode'] : null
}

function copyText(value: string) {
  void navigator.clipboard?.writeText(value)
}
