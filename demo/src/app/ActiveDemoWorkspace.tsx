import { useEffect } from 'react'
import { useDemoPattern } from '../shared/demoPatterns'
import type { SourceName } from '../shared/sources'
import { defaultAppState, readInitialAppState, type AppAction, type AppState, writeAppHash } from './appState'
import { VariantRouteProvider } from '../shared/variantRoute'
import { ds } from '../shared/designSystem'
import { ActiveDemoRightPanel } from './ActiveDemoRightPanel'

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
  const activeSourceName = activeDemo.sourceNames.includes(state.sourceName as SourceName) ? state.sourceName as SourceName : activeDemo.sourceNames[0]
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
      <section className={`${ds.panel} overflow-auto`}>
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">{activeDemo.label}</h2>
          <button
            type="button"
            className={ds.textButton}
            aria-controls="demo-right-panel"
            aria-expanded={state.rightPanelOpen}
            onClick={() => dispatch({ type: 'toggleRightPanel' })}
          >
            code
          </button>
        </header>
        {activeDemo.variants ? <div className="mb-4">{activeDemo.variants}</div> : null}
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
