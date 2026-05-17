import { useToolbarPattern, type PatternData, type PatternEvent } from '../../../../src'

export function Toolbar({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const toolbar = useToolbarPattern(data, onEvent)

  return (
    <div
      {...toolbar.rootProps}
      className="inline-flex gap-1 rounded-xl bg-zinc-100/75 p-1 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10"
    >
      {toolbar.renderItems.map((item) => {
        return (
          <button
            type="button"
            {...item.itemProps}
            key={item.key}
            className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-zinc-700 outline-none transition hover:bg-white/75 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-500"
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
