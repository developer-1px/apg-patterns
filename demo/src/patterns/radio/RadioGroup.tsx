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
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm text-zinc-800 outline-none transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:focus-visible:outline-zinc-500 dark:data-[focus-visible]:outline-zinc-500"
          >
            <span className="grid size-4 place-items-center rounded-full bg-white shadow-[inset_0_1px_2px_rgba(24,24,27,0.08),0_2px_8px_rgba(24,24,27,0.08)] dark:bg-white/[0.07] dark:shadow-black/20" aria-hidden="true">
              {item.state.checked ? <span className="size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" /> : null}
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
