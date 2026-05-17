import { useWindowSplitterPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { Icon } from '../../shared/Icon'

export function WindowSplitter({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const splitter = useWindowSplitterPattern(data, onEvent, options)
  if (!splitter.key) return null

  return (
    <div className="flex h-32 w-full overflow-hidden rounded border border-zinc-300 dark:border-zinc-700">
      <div
        id={splitter.controlledKey ? splitter.ids.forKey(splitter.controlledKey) : undefined}
        className="bg-zinc-100 dark:bg-zinc-900"
        style={{ width: `${splitter.state.position}%` }}
        data-testid="windowsplitter-primary"
      />
      <div
        {...splitter.separatorProps}
        className="grid w-4 cursor-col-resize place-items-center bg-zinc-200 text-xs text-zinc-500 outline-none focus:bg-zinc-300 focus:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:focus:bg-zinc-700 dark:focus:text-zinc-100"
      >
        <Icon name="grip-vertical" />
      </div>
      <div className="flex-1 bg-white dark:bg-zinc-950" data-testid="windowsplitter-secondary" />
    </div>
  )
}
