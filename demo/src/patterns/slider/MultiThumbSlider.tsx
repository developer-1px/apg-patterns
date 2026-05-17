import type { ReactSliderRenderItem } from '../../../../src'

export function MultiThumbSlider({ items }: { items: readonly ReactSliderRenderItem[] }) {
  const [minThumb, maxThumb] = items
  if (!minThumb || !maxThumb) return null

  return (
    <div className="grid max-w-md gap-3">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>Price range</span>
        <span>${minThumb.value} - ${maxThumb.value}</span>
      </div>
      <div className="relative h-2 rounded bg-zinc-100 dark:bg-zinc-900">
        <div
          className="absolute inset-y-0 rounded bg-zinc-900 dark:bg-zinc-100"
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
      className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-900 bg-white outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-100 dark:bg-zinc-950"
    >
      <span className="sr-only">{item.label}</span>
    </button>
  )
}
