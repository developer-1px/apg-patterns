import { useSwitchPattern, type PatternData, type PatternEvent } from '../../../../src'

const itemClass =
  'inline-flex h-8 max-w-sm items-center gap-2 rounded-lg px-2 text-sm text-zinc-800 outline-none transition hover:bg-zinc-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:focus-visible:outline-zinc-500'

export function Switch({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = useSwitchPattern(data, onEvent)
  if (runtime.renderItems.length === 0) return null

  return (
    <div className="grid gap-1">
      {runtime.renderItems.map((item) => {
        const on = item.state.checked
        return (
          <div
            key={item.key}
            {...item.switchProps}
            className={itemClass}
          >
            <span
              aria-hidden="true"
              className={`relative inline-block h-4 w-7 rounded-full shadow-inner transition ${on ? 'bg-zinc-800 shadow-zinc-700/20 dark:bg-zinc-200 dark:shadow-black/20' : 'bg-zinc-200 shadow-zinc-300/80 dark:bg-white/[0.1] dark:shadow-black/20'}`}
            >
              <span
                className={`absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white shadow-[0_2px_8px_rgba(24,24,27,0.22)] transition dark:bg-zinc-100 ${on ? 'left-3.5' : 'left-0.5'}`}
              />
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
