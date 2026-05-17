import { useSpinbuttonPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactSpinbuttonRenderItem } from '../../../../src'
import { Icon } from '../../shared/Icon'

export function Spinbutton({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const spinbutton = useSpinbuttonPattern(data, onEvent, options)
  if (spinbutton.renderItems.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      {spinbutton.renderItems.map((item, idx) => (
        <SpinField
          key={item.key}
          item={item}
          separator={idx < spinbutton.renderItems.length - 1 && spinbutton.renderItems.length > 1 ? ':' : null}
        />
      ))}
    </div>
  )
}

function SpinField({
  item,
  separator,
}: {
  item: ReactSpinbuttonRenderItem
  separator: string | null
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="grid gap-1">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{item.label}</span>
        <div className="flex items-center gap-1">
          <button
            {...item.decrementButtonProps}
            className="grid size-6 place-items-center rounded border border-zinc-300 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            <Icon name="minus" />
          </button>
          <div
            {...item.spinbuttonProps}
            data-testid={`spinbutton-${item.key}`}
            className="min-w-[2.5rem] rounded border border-zinc-300 px-2 py-1 text-center outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-700 dark:focus:outline-zinc-500"
          >
            {item.value}
          </div>
          <button
            {...item.incrementButtonProps}
            className="grid size-6 place-items-center rounded border border-zinc-300 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      {separator ? <span className="self-end pb-1 text-lg">{separator}</span> : null}
    </div>
  )
}
