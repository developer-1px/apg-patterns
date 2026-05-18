import { useComboboxPattern, type PatternData, type PatternEvent } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'

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
        className={cx(ds.field, 'h-9 rounded-xl bg-white/85 text-zinc-900 shadow-[0_8px_24px_rgba(24,24,27,0.06)] placeholder:text-zinc-400 dark:bg-white/[0.065] dark:text-zinc-100')}
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
                className={cx(ds.listOption, 'cursor-pointer rounded-md ui-active:bg-zinc-900 ui-active:font-medium ui-active:text-white ui-active:shadow-sm ui-selected:bg-zinc-900 ui-selected:font-medium ui-selected:text-white dark:ui-active:bg-zinc-100 dark:ui-active:text-zinc-950 dark:ui-selected:bg-zinc-100 dark:ui-selected:text-zinc-950')}
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
