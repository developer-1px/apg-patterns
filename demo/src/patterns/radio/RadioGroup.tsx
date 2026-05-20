import { useRadioGroupPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

export function RadioGroup({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const radio = useRadioGroupPattern(data, onEvent, options)

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
            className={cx(ds.option, ds.checkable, 'inline-flex h-8 items-center gap-2 text-sm')}
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
