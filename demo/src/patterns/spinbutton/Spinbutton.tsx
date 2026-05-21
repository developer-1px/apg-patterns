import { useSpinbuttonPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactSpinbuttonRenderItem } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
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
            className={cx(ds.iconButton, 'text-zinc-600')}
          >
            <Icon name="minus" />
          </button>
          <div
            {...item.spinbuttonProps}
            data-testid={`spinbutton-${item.key}`}
            className={cx('min-w-[2.75rem] rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-center dark:border-white/10 dark:bg-white/[0.04]', ds.focusRing)}
          >
            {item.value}
          </div>
          <button
            {...item.incrementButtonProps}
            className={cx(ds.iconButton, 'text-zinc-600')}
          >
            <Icon name="plus" />
          </button>
        </div>
      </div>
      {separator ? <span className="self-end pb-1 text-lg">{separator}</span> : null}
    </div>
  )
}
