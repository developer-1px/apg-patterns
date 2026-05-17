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
        className="h-9 w-full rounded-xl bg-white/85 px-3 text-sm text-zinc-900 shadow-[0_8px_24px_rgba(24,24,27,0.06)] outline-none transition placeholder:text-zinc-400 focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-zinc-400 dark:bg-white/[0.065] dark:text-zinc-100 dark:shadow-black/20 dark:focus:bg-white/[0.09] dark:focus-visible:outline-zinc-500 dark:data-[focus-visible]:outline-zinc-500"
      />
      {combobox.open ? (
        <div
          {...combobox.listboxProps}
          id={combobox.listboxId}
          className="absolute left-0 right-0 top-11 z-10 max-h-56 overflow-auto rounded-xl bg-white/96 p-1 shadow-[0_22px_64px_rgba(24,24,27,0.16)] backdrop-blur dark:bg-zinc-950/96 dark:shadow-black/35"
        >
          {combobox.options.length === 0 ? (
            <div className="rounded-lg px-2.5 py-2 text-sm text-zinc-500 dark:text-zinc-400">No results</div>
          ) : (
            combobox.options.map((option) => (
              <div
                key={option.key}
                {...option.optionProps}
                data-active={option.state.active ? '' : undefined}
                className="cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-zinc-800 outline-none transition aria-selected:bg-zinc-900 aria-selected:font-medium aria-selected:text-white aria-selected:shadow-sm data-active:bg-zinc-900 data-active:font-medium data-active:text-white data-active:shadow-sm data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-zinc-400 dark:text-zinc-200 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950 dark:data-active:bg-zinc-100 dark:data-active:text-zinc-950 dark:data-[focus-visible]:outline-zinc-500"
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
