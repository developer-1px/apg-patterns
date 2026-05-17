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
      <div className="relative h-2 rounded-full bg-zinc-100/80 shadow-inner shadow-zinc-200/70 dark:bg-white/[0.06] dark:shadow-black/20">
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
      className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_6px_18px_rgba(24,24,27,0.26),inset_0_1px_1px_rgba(255,255,255,0.7)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 dark:bg-zinc-100 dark:focus-visible:outline-zinc-500"
    >
      <span className="sr-only">{item.label}</span>
    </button>
  )
}
