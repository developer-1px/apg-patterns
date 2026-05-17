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
      className="inline-flex gap-1 rounded border border-zinc-300 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {toolbar.renderItems.map((item) => {
        return (
          <button
            type="button"
            {...item.itemProps}
            key={item.key}
            className="inline-flex h-8 items-center rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500"
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
