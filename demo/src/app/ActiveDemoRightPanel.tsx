import { Icon } from '../shared/Icon'
import type { SourceName } from '../shared/sources'
import type { DemoPattern } from '../shared/demoPatternTypes'
import { cx, ds } from '../shared/designSystem'
import { SourceTabs, useSourceTabs } from './SourceTabs'
import { formatEvent } from './eventLog'
import { useSourcePreviewState } from './useSourcePreviewState'
import { rightModeLabels, rightModes, type AppAction, type AppState } from './appState'

export function ActiveDemoRightPanel({
  activeDemo,
  activeSourceName,
  state,
  dispatch,
}: {
  activeDemo: DemoPattern
  activeSourceName: SourceName
  state: AppState
  dispatch: (action: AppAction) => void
}) {
  const sourceTabs = useSourceTabs({ label: 'source files', tabs: activeDemo.sourceNames, value: activeSourceName, onChange: (sourceName) => dispatch({ type: 'selectSource', sourceName }) })
  const rightModeTabs = useSourceTabs({ label: 'right panel', tabs: rightModes, value: state.rightMode, onChange: (rightMode) => dispatch({ type: 'selectRightMode', rightMode }) })
  const eventLog = state.events.map(formatEvent).join('\n')
  const { canCopySource, copySource, copyState, displayedSource } = useSourcePreviewState(activeSourceName)

  return (
    <section className={`${ds.panel} overflow-auto flex min-h-0 flex-col`}>
      <div {...rightModeTabs.getTablistProps()} className={cx('mb-3 flex items-center gap-1', ds.controlGroup)}>
        {rightModes.map((mode) => (
          <button {...rightModeTabs.getTabProps(mode)} key={mode} type="button" className={cx('inline-flex h-8 items-center', ds.option)}>
            {rightModeLabels[mode]}
          </button>
        ))}
      </div>
      <div {...rightModeTabs.getPanelProps()} className="flex min-h-0 flex-col gap-3">
        {state.rightMode === 'source' ? (
          <SourceTabs tabs={activeDemo.sourceNames} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
        ) : null}
        {state.rightMode === 'inspect' ? activeDemo.inspectControls : null}
        {state.rightMode === 'log' ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{state.events.length} events</div>
            <button type="button" className={ds.textButton} onClick={() => dispatch({ type: 'clearEvents' })}>
              clear
            </button>
          </div>
        ) : null}
        {state.rightMode === 'source' ? (
          <div className="relative min-h-0">
            <button
              type="button"
              className={cx(ds.iconButton, 'absolute right-2 top-2 z-10 size-8 bg-transparent text-zinc-400 hover:bg-white/10 hover:text-zinc-100 disabled:cursor-not-allowed')}
              aria-label={copyState === 'idle' ? 'copy' : 'copied'}
              aria-live="polite"
              onClick={copySource}
              disabled={!canCopySource}
            >
              <Icon name={copyState === 'idle' ? 'copy' : 'check'} className="size-4" />
            </button>
            <pre {...sourceTabs.getPanelProps()} className={`${ds.codeBlock} select-text cursor-text`}>
              {displayedSource}
            </pre>
          </div>
        ) : null}
        {state.rightMode === 'inspect' ? <pre className={ds.dataBlock}>{activeDemo.inspect}</pre> : null}
        {state.rightMode === 'log' ? <pre className={ds.dataBlock}>{eventLog}</pre> : null}
      </div>
    </section>
  )
}
