import { useComboboxPattern, type PatternData, type PatternEvent } from '../../../../src'

export function Combobox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const combobox = useComboboxPattern(data, onEvent)

  return (
    <div className="relative grid max-w-sm gap-1">
      <input
        ref={combobox.setInputRef}
        {...combobox.inputProps}
        className="h-9 w-full rounded-xl bg-white/80 px-3 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-black/[0.03] transition placeholder:text-zinc-400 focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-100 dark:ring-white/[0.04] dark:focus:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
      />
      {combobox.open ? (
        <div
          {...combobox.listboxProps}
          id={combobox.listboxId}
          className="absolute left-0 right-0 top-11 z-10 max-h-56 overflow-auto rounded-xl bg-white/95 p-1 shadow-[0_18px_50px_rgba(24,24,27,0.14)] ring-1 ring-black/[0.03] backdrop-blur dark:bg-zinc-950/95 dark:shadow-black/30 dark:ring-white/[0.05]"
        >
          {combobox.options.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-zinc-500">No matches</div>
          ) : (
            combobox.options.map((option) => (
              <div
                key={option.key}
                {...option.optionProps}
                data-active={option.state.active ? '' : undefined}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none transition aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-100/70 dark:text-zinc-200 dark:aria-selected:bg-white/[0.08] dark:aria-selected:text-zinc-50 dark:data-active:bg-white/[0.06]"
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
