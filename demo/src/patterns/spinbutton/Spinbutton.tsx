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
            className={cx('min-w-[2.75rem] rounded-lg bg-white/80 px-2.5 py-1 text-center shadow-[0_6px_18px_rgba(24,24,27,0.06)] dark:bg-white/[0.065] dark:shadow-black/20', ds.focusRing)}
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
