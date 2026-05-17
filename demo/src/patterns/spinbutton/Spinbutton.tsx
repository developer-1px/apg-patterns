import { useSpinbuttonPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactSpinbuttonRenderItem } from '../../../../src'
import { Icon } from '../../shared/Icon'

export function Spinbutton({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const spinbutton = useSpinbuttonPattern(data, onEvent, options)
  if (spinbutton.renderItems.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {spinbutton.renderItems.map((item, idx) => (
        <SpinField
          key={item.key}
          item={item}
          separator={idx < spinbutton.renderItems.length - 1 && spinbutton.renderItems.length > 1 ? ':' : null}
        />
      ))}
    </div>
  )
}

function SpinField({
  item,
  separator,
}: {
  item: ReactSpinbuttonRenderItem
  separator: string | null
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="grid gap-1">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.label}</span>
        <div className="flex items-center gap-1">
          <button
            {...item.decrementButtonProps}
            className="grid size-7 place-items-center rounded-lg bg-zinc-100/80 text-xs text-zinc-600 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
          >
            <Icon name="minus" />
          </button>
          <div
            {...item.spinbuttonProps}
            data-testid={`spinbutton-${item.key}`}
            className="min-w-[2.75rem] rounded-lg bg-white/80 px-2.5 py-1 text-center shadow-[0_6px_18px_rgba(24,24,27,0.06)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.065] dark:shadow-black/20 dark:focus-visible:outline-zinc-500"
          >
            {item.value}
          </div>
          <button
            {...item.incrementButtonProps}
            className="grid size-7 place-items-center rounded-lg bg-zinc-100/80 text-xs text-zinc-600 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      {separator ? <span className="self-end pb-1 text-lg">{separator}</span> : null}
    </div>
  )
}
