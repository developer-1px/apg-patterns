import { useWindowSplitterPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
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
    <div className="flex h-32 w-full overflow-hidden rounded-xl bg-white/65 shadow-[0_14px_36px_rgba(24,24,27,0.08)] dark:bg-white/[0.045] dark:shadow-black/20">
      <div
        id={splitter.controlledKey ? splitter.ids.forKey(splitter.controlledKey) : undefined}
        className="bg-zinc-100/80 dark:bg-white/[0.06]"
        style={{ width: `${splitter.state.position}%` }}
        data-testid="windowsplitter-primary"
      />
      <div
        {...splitter.separatorProps}
        className={cx('grid w-4 cursor-col-resize place-items-center bg-zinc-200/80 text-xs text-zinc-500 transition ui-focus:bg-zinc-300 ui-focus:text-zinc-900 dark:bg-white/[0.08] dark:text-zinc-400 dark:ui-focus:bg-white/[0.12] dark:ui-focus:text-zinc-100', ds.focusRing)}
      >
        <Icon name="grip-vertical" />
      </div>
      <div className="flex-1 bg-white/60 dark:bg-transparent" data-testid="windowsplitter-secondary" />
    </div>
  )
}
