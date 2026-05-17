import { useEffect, useReducer, useRef, useState } from 'react'
import { useDemoPattern } from '../shared/demoPatterns'
import { Icon, type IconName } from '../shared/Icon'
import type { SourceName } from '../shared/sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'
import { defaultAppState, readInitialAppState, rightModeLabels, rightModes, type AppAction, type AppState, writeAppHash } from './appState'
import { formatEvent } from './eventLog'
import { isCopyableSource, loadSourcePreview } from './sourcePreview'

const panelClass = 'min-h-0 rounded-xl bg-white/92 p-3 shadow-[0_16px_48px_rgba(24,24,27,0.07)] backdrop-blur dark:bg-zinc-950/90 dark:shadow-[0_18px_54px_rgba(0,0,0,0.34)]'
export const scrollPanelClass = `${panelClass} overflow-auto`
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const buttonClass = 'inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium text-zinc-600 outline-none transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500'
const preClass = 'max-h-[44dvh] min-h-0 overflow-auto rounded-xl bg-zinc-100/65 p-4 font-mono text-[12px] leading-6 text-zinc-700 shadow-inner shadow-zinc-200/35 dark:bg-white/[0.04] dark:text-zinc-300 dark:shadow-black/10 lg:h-full lg:max-h-none'
const sourcePreClass = 'max-h-[44dvh] min-h-0 overflow-auto rounded-xl bg-zinc-950 p-4 pr-12 font-mono text-[11px] leading-5 text-zinc-200 shadow-inner shadow-black/30 lg:h-full lg:max-h-none'
const optionButtonClass =
  'inline-flex h-8 items-center rounded-lg px-2.5 text-left text-xs font-medium text-zinc-500 outline-none transition hover:bg-white/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-white aria-selected:text-zinc-950 aria-selected:shadow-sm dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950'
const keycapClass = 'inline-flex min-h-6 items-center gap-1 rounded-md bg-gradient-to-b from-white to-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(39,39,42,0.12),0_1px_1px_rgba(39,39,42,0.14)] dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(0,0,0,0.55),0_1px_1px_rgba(0,0,0,0.45)]'

type SourcePreviewState = {
  name: SourceName
  text: string
}

const sourcePreviewCache = new Map<SourceName, string>()

export function ActiveDemoWorkspace({
  state,
  dispatch,
}: {
  state: AppState
  dispatch: (action: AppAction) => void
}) {
  const activeDemo = useDemoPattern(state.patternKey, (event) => dispatch({ type: 'recordEvent', event }))
  const sourceNames = activeDemo.sourceNames
  const activeSourceName = sourceNames.includes(state.sourceName as SourceName) ? state.sourceName as SourceName : sourceNames[0]
  const [sourcePreview, setSourcePreview] = useState<SourcePreviewState>(() => ({
    name: activeSourceName,
    text: sourcePreviewCache.get(activeSourceName) ?? 'loading',
  }))
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const copyRequestId = useRef(0)
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const eventLog = state.events.map(formatEvent).join('\n') || 'none'
  const source = sourcePreview.text
  const sourceLoadedForActiveTab = sourcePreview.name === activeSourceName
  const displayedSource = sourceLoadedForActiveTab ? source : 'loading'
  const canCopySource = isCopyableSource(displayedSource)
  const previewKeyboardShortcuts = activeDemo.keyboardShortcuts.join(' ') || undefined

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
    copyRequestId.current += 1
    setCopyState('idle')
    const cachedSource = sourcePreviewCache.get(activeSourceName)
    if (cachedSource) setSourcePreview({ name: activeSourceName, text: cachedSource })
    loadSourcePreview(activeSourceName).then((nextSource) => {
      if (cancelled) return
      sourcePreviewCache.set(activeSourceName, nextSource)
      setSourcePreview({ name: activeSourceName, text: nextSource })
    })
    return () => {
      copyRequestId.current += 1
      cancelled = true
    }
  }, [activeSourceName])

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = window.setTimeout(() => setCopyState('idle'), 1200)
    return () => window.clearTimeout(timer)
  }, [copyState])

  const copySource = () => {
    if (!canCopySource) return
    const requestId = copyRequestId.current + 1
    copyRequestId.current = requestId
    void copyText(displayedSource).then((copied) => {
      if (copied && copyRequestId.current === requestId) setCopyState('copied')
    })
  }

  return (
    <>
      <section className={scrollPanelClass}>
        <header className={headerClass}>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{activeDemo.label}</h2>
          </div>
          <div className="flex items-center gap-1">
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
        {activeDemo.variants ? <div className="mb-4 rounded-xl bg-zinc-100/70 p-2 dark:bg-white/[0.045]">{activeDemo.variants}</div> : null}
        {activeDemo.keyboardShortcuts.length > 0 ? (
          <div className="mb-5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-600">keys</div>
            <div className="flex flex-wrap gap-1">
              {activeDemo.keyboardShortcuts.map((shortcut) => (
                <kbd key={shortcut} className={keycapClass}>
                  <ShortcutIndicator shortcut={shortcut} />
                </kbd>
              ))}
            </div>
          </div>
        ) : null}
        <div data-demo-preview={activeDemo.key} aria-keyshortcuts={previewKeyboardShortcuts}>
          {activeDemo.preview}
        </div>
      </section>

      {state.rightPanelOpen ? (
        <section className={`${panelClass} flex min-h-0 flex-col`}>
          <header className="mb-3 grid gap-2">
            <div {...rightModeTabs.getTablistProps()} className="flex items-center gap-1 rounded-xl bg-zinc-100/75 p-1 dark:bg-white/[0.045]">
              {rightModes.map((mode) => (
                <button {...rightModeTabs.getTabProps(mode)} key={mode} type="button" className={optionButtonClass}>
                  {rightModeLabels[mode]}
                </button>
              ))}
            </div>
          </header>
          <div {...rightModeTabs.getPanelProps()} className="flex min-h-0 flex-col gap-3">
            {state.rightMode === 'source' ? (
              <div className="grid gap-1">
                <div className="flex min-w-0 items-start gap-2">
                  <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
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
            {state.rightMode === 'source' ? (
              <div className="relative min-h-0">
                <button
                  type="button"
                  className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 outline-none transition hover:bg-white/10 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={copyState === 'idle' ? 'copy' : copyState}
                  title={copyState === 'idle' ? 'Copy source' : 'Copied'}
                  onClick={copySource}
                  disabled={!canCopySource}
                >
                  <Icon name={copyState === 'idle' ? 'copy' : 'check'} className="size-4" />
                </button>
                <pre {...sourceTabs.getPanelProps()} className={`${sourcePreClass} select-text cursor-text`}>
                  {displayedSource}
                </pre>
              </div>
            ) : null}
            {state.rightMode === 'inspect' ? <pre className={preClass}>{activeDemo.inspect}</pre> : null}
            {state.rightMode === 'log' ? <pre className={preClass}>{eventLog}</pre> : null}
          </div>
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

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard?.writeText(value)
    return Boolean(navigator.clipboard)
  } catch {
    return false
  }
}
