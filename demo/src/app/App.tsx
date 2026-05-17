import { useEffect, useReducer, useState } from 'react'
import { z } from 'zod'
import type { PatternEvent } from '../../../src'
import { PatternMenu } from './PatternMenu'
import { patternItems, type PatternKey, useDemoPattern } from '../shared/demoPatterns'
import { Icon, type IconName } from '../shared/Icon'
import { sourceLoaders, type SourceName } from '../shared/sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'

const panelClass = 'min-h-0 rounded-lg border border-zinc-200/80 bg-white/95 p-3 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-black/20'
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const titleClass = 'truncate text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-500'
const buttonClass = 'inline-flex h-8 items-center justify-center rounded-md border border-transparent px-2.5 text-xs font-medium text-zinc-600 outline-none transition hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500'
const preClass = 'h-full min-h-0 overflow-auto rounded-md border border-zinc-200 bg-zinc-50/80 p-4 font-mono text-[12px] leading-6 text-zinc-700 shadow-inner shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300 dark:shadow-black/10'
const optionButtonClass =
  'inline-flex h-8 items-center rounded-md px-2.5 text-left text-xs font-medium text-zinc-500 outline-none transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950'
const rightModes = ['source', 'inspect', 'log'] as const
const rightModeLabels: Record<(typeof rightModes)[number], string> = {
  source: 'code',
  inspect: 'state',
  log: 'events',
}
const rightModesByLabel = {
  code: 'source',
  aria: 'inspect',
  state: 'inspect',
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
    <main className={`grid h-dvh grid-cols-1 ${state.rightPanelOpen ? 'grid-rows-[minmax(112px,16dvh)_minmax(320px,1fr)_minmax(300px,36dvh)]' : 'grid-rows-[minmax(112px,18dvh)_minmax(0,1fr)]'} gap-4 bg-zinc-50 px-3 py-3 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-4 sm:py-4 ${state.rightPanelOpen ? 'lg:grid-cols-[220px_minmax(420px,1fr)_minmax(420px,0.92fr)]' : 'lg:grid-cols-[220px_minmax(420px,1fr)]'} lg:grid-rows-[minmax(0,1fr)] lg:gap-4 lg:px-5 lg:py-5`}>
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <h1 className={titleClass}>patterns</h1>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500">
            {patternItems.length}
          </span>
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
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const eventLog = state.events.map(formatEvent).join('\n') || 'none'

  useEffect(() => {
    writeAppHash({
      patternKey: activeDemo.key,
      sourceName: activeSourceName,
      rightMode: state.rightMode,
      rightPanelOpen: state.rightPanelOpen,
    })
  }, [activeDemo.key, activeSourceName, state.rightMode, state.rightPanelOpen])

  useEffect(() => {
    if (state.sourceName !== activeSourceName) dispatch({ type: 'selectSource', sourceName: activeSourceName })
  }, [activeSourceName, state.sourceName])

  useEffect(() => {
    const restoreFromHash = () => dispatch({ type: 'restoreState', state: readInitialAppState(defaultAppState) })
    window.addEventListener('hashchange', restoreFromHash)
    return () => window.removeEventListener('hashchange', restoreFromHash)
  }, [])

  useEffect(() => {
    let cancelled = false
    setCopyState('idle')
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

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1200)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const copySource = () => {
    setCopyState('copied')
    void copyText(source)
  }

  return (
    <>
      <section className={`${panelClass} overflow-auto`}>
        <header className={headerClass}>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{activeDemo.label}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={`${buttonClass} aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-950`}
              aria-pressed={state.rightPanelOpen}
              onClick={() => dispatch({ type: 'toggleRightPanel' })}
              title={state.rightPanelOpen ? 'Hide source panel' : 'Show source panel'}
            >
              code
            </button>
          </div>
        </header>
        {activeDemo.variants ? <div className="mb-4 rounded-md border border-zinc-200 bg-zinc-50/70 p-2 dark:border-zinc-800 dark:bg-zinc-900/40">{activeDemo.variants}</div> : null}
        {activeDemo.keyboardShortcuts.length > 0 ? (
          <div className="mb-5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-600">keys</div>
            <div className="flex flex-wrap gap-1">
              {activeDemo.keyboardShortcuts.map((shortcut) => (
                <kbd key={shortcut} className="inline-flex min-h-6 items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
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
          <div {...rightModeTabs.getTablistProps()} className="flex items-center gap-1 rounded-md bg-zinc-100 p-1 dark:bg-zinc-900">
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
                  <button type="button" className={`${buttonClass} w-16 shrink-0`} onClick={copySource}>
                    {copyState === 'idle' ? 'copy' : copyState}
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

async function copyText(value: string): Promise<void> {
  await navigator.clipboard?.writeText(value)
}

function formatEvent(event: PatternEvent): string {
  const fields = Object.entries(event)
    .filter(([key, value]) => key !== 'type' && key !== 'meta' && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${formatEventValue(value)}`)
  const reason = event.meta?.reason ? ` via ${event.meta.reason}` : ''
  return fields.length > 0 ? `${event.type} ${fields.join(' ')}${reason}` : `${event.type}${reason}`
}

function formatEventValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.join(',')}]`
  return String(value)
}
