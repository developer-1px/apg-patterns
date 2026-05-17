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
    <div className="flex h-32 w-full overflow-hidden rounded-xl bg-white/60 shadow-[0_12px_32px_rgba(24,24,27,0.08)] ring-1 ring-black/[0.03] dark:bg-white/[0.04] dark:shadow-black/20 dark:ring-white/[0.04]">
      <div
        id={splitter.controlledKey ? splitter.ids.forKey(splitter.controlledKey) : undefined}
        className="bg-zinc-100/80 dark:bg-white/[0.06]"
        style={{ width: `${splitter.state.position}%` }}
        data-testid="windowsplitter-primary"
      />
      <div
        {...splitter.separatorProps}
        className="grid w-4 cursor-col-resize place-items-center bg-zinc-200/80 text-xs text-zinc-500 outline-none transition focus-visible:bg-zinc-300 focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.08] dark:text-zinc-400 dark:focus-visible:bg-white/[0.12] dark:focus-visible:text-zinc-100 dark:focus-visible:outline-zinc-500"
      >
        <Icon name="grip-vertical" />
      </div>
      <div className="flex-1 bg-white/60 dark:bg-transparent" data-testid="windowsplitter-secondary" />
    </div>
  )
}
