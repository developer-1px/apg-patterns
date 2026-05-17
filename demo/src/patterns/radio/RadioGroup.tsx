import { useRadioGroupPattern, type PatternData, type PatternEvent } from '../../../../src'

export function RadioGroup({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const radio = useRadioGroupPattern(data, onEvent)

  return (
    <div
      {...radio.rootProps}
      className="grid max-w-sm gap-1 outline-none"
    >
      {radio.renderItems.map((item) => {
        return (
          <div
            {...item.radioProps}
            key={item.key}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-zinc-800 outline-none transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:focus-visible:outline-zinc-500"
          >
            <span className="grid size-4 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/10 dark:bg-white/[0.06] dark:ring-white/10" aria-hidden="true">
              {item.state.checked ? <span className="size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" /> : null}
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
