import { useEffect } from 'react'
import { useDemoPattern } from '../shared/demoPatterns'
import type { SourceName } from '../shared/sources'
import { defaultAppState, readInitialAppState, type AppAction, type AppState, writeAppHash } from './appState'
import { ShortcutIndicator } from './ShortcutIndicator'
import { VariantRouteProvider } from '../shared/variantRoute'
import { ds } from '../shared/designSystem'
import { ActiveDemoRightPanel } from './ActiveDemoRightPanel'

const panelClass = ds.panel
export const scrollPanelClass = `${panelClass} overflow-auto`
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const buttonClass = ds.textButton

export function ActiveDemoWorkspace({
  state,
  dispatch,
}: {
  state: AppState
  dispatch: (action: AppAction) => void
}) {
  const activeDemo = useDemoPattern(state.patternKey, (event) => {
    window.dispatchEvent(new window.CustomEvent('apg-pattern-event', {
      detail: {
        event,
        patternKey: state.patternKey,
        sourceName: state.sourceName,
        rightMode: state.rightMode,
      },
    }))
    dispatch({ type: 'recordEvent', event })
  })
  const sourceNames = activeDemo.sourceNames
  const activeSourceName = sourceNames.includes(state.sourceName as SourceName) ? state.sourceName as SourceName : sourceNames[0]
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

  return (
    <VariantRouteProvider patternKey={activeDemo.key}>
      <section className={scrollPanelClass}>
        <header className={headerClass}>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{activeDemo.label}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={buttonClass}
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
                <kbd key={shortcut} className={ds.keycap}>
                  <ShortcutIndicator shortcut={shortcut} />
                </kbd>
              ))}
            </div>
          </div>
        ) : null}
        <div
          data-demo-preview={activeDemo.key}
          aria-label={previewKeyboardShortcuts ? `${activeDemo.label} preview keyboard shortcuts` : undefined}
          aria-keyshortcuts={previewKeyboardShortcuts}
          tabIndex={previewKeyboardShortcuts ? 0 : undefined}
        >
          {activeDemo.preview}
        </div>
      </section>

      {state.rightPanelOpen ? (
        <ActiveDemoRightPanel activeDemo={activeDemo} activeSourceName={activeSourceName} state={state} dispatch={dispatch} />
      ) : null}
    </VariantRouteProvider>
  )
}
