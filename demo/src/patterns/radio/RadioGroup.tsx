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
            className="inline-flex h-8 items-center gap-2 rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500"
          >
            <span className="grid size-4 place-items-center rounded-full border border-zinc-400 dark:border-zinc-600" aria-hidden="true">
              {item.state.checked ? <span className="size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" /> : null}
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
