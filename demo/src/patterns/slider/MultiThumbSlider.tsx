import type { ReactSliderRenderItem } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

export function MultiThumbSlider({ items }: { items: readonly ReactSliderRenderItem[] }) {
  const [minThumb, maxThumb] = items
  if (!minThumb || !maxThumb) return null

  return (
    <div className="grid max-w-md gap-3">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>Price range</span>
        <span>${minThumb.value} - ${maxThumb.value}</span>
      </div>
      <div className="relative h-2 rounded-full bg-zinc-100/80 dark:bg-white/[0.06]">
        <div
          className="absolute inset-y-0 rounded-full bg-zinc-900 dark:bg-zinc-100"
          style={{ left: `${minThumb.position}%`, width: `${Math.max(0, maxThumb.position - minThumb.position)}%` }}
        />
        <MultiThumbSliderThumb item={minThumb} />
        <MultiThumbSliderThumb item={maxThumb} />
      </div>
    </div>
  )
}

function MultiThumbSliderThumb({ item }: { item: ReactSliderRenderItem }) {
  return (
    <button
      {...item.sliderProps}
      type="button"
      aria-valuenow={item.value}
      style={{ left: `${item.position}%` }}
      className={cx('absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300 bg-white ui-focus:outline-offset-4 dark:border-white/20 dark:bg-zinc-100', ds.focusRing)}
    >
      <span className="sr-only">{item.label}</span>
    </button>
  )
}
