import { useEffect } from 'react'
import { useDemoPattern } from '../shared/demoPatterns'
import { Icon } from '../shared/Icon'
import type { SourceName } from '../shared/sources'
import { SourceTabs, useSourceTabs } from './SourceTabs'
import { defaultAppState, readInitialAppState, rightModeLabels, rightModes, type AppAction, type AppState, writeAppHash } from './appState'
import { formatEvent } from './eventLog'
import { ShortcutIndicator } from './ShortcutIndicator'
import { useSourcePreviewState } from './useSourcePreviewState'
import { VariantRouteProvider } from '../shared/variantRoute'
import { cx, ds } from '../shared/designSystem'

const panelClass = ds.panel
export const scrollPanelClass = `${panelClass} overflow-auto`
const headerClass = 'mb-4 flex items-center justify-between gap-3'
const buttonClass = ds.textButton
const preClass = ds.dataBlock
const sourcePreClass = ds.codeBlock
const optionButtonClass = cx('inline-flex h-8 items-center', ds.option)

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
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const eventLog = state.events.map(formatEvent).join('\n') || 'none'
  const { canCopySource, copySource, copyState, displayedSource } = useSourcePreviewState(activeSourceName)
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
                <kbd key={shortcut} className={ds.keycap}>
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
            <div {...rightModeTabs.getTablistProps()} className={cx('flex items-center gap-1', ds.controlGroup)}>
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
    </VariantRouteProvider>
  )
}
