import { useSliderPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactSliderRenderItem } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

const thumbColorClass: Record<string, string> = {
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
}

export function Slider({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const slider = useSliderPattern(data, onEvent, options)
  if (slider.renderItems.length === 0) return null

  if (slider.isMultiThumb) {
    return <MultiThumbSlider items={slider.renderItems} />
  }

  const containerClass = slider.renderItems.length > 1 ? 'grid max-w-sm gap-5' : 'grid max-w-sm gap-3'

  return (
    <div className={containerClass}>
      {slider.renderItems.map((item) => (
        <ThumbSlider key={item.key} item={item} orientation={slider.orientation} />
      ))}
    </div>
  )
}

function ThumbSlider({
  item,
  orientation,
}: {
  item: ReactSliderRenderItem
  orientation: 'horizontal' | 'vertical'
}) {
  const isVertical = orientation === 'vertical'

  return (
    <div
      {...item.sliderProps}
      className={cx('grid gap-2 ui-focus:outline-offset-4', ds.focusRing)}
    >
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>{item.label}</span>
        <span>{item.valueText ?? item.value}</span>
      </div>
      {isVertical ? (
        <div
          data-testid={`slider-track-${item.key}`}
          className="relative h-32 w-2 rounded-full bg-zinc-100/80 dark:bg-white/[0.06]"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId)
            event.currentTarget.parentElement?.focus({ preventScroll: true })
            item.updateFromPointer(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            item.updateFromPointer(event)
          }}
        >
          <div className="absolute inset-x-0 bottom-0 rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ height: `${item.position}%` }} />
          <div
            className={`absolute left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-300 bg-white dark:border-white/20 dark:bg-zinc-100 ${thumbColorClass[String(item.key)] ?? ''}`}
            style={{ bottom: `${item.position}%` }}
          />
        </div>
      ) : (
        <div
          data-testid={`slider-track-${item.key}`}
          className="relative h-2 rounded-full bg-zinc-100/80 dark:bg-white/[0.06]"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId)
            event.currentTarget.parentElement?.focus({ preventScroll: true })
            item.updateFromPointer(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            item.updateFromPointer(event)
          }}
        >
          <div className={`absolute inset-y-0 left-0 rounded-full ${thumbColorClass[String(item.key)] ?? 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${item.position}%` }} />
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-300 bg-white dark:border-white/20 dark:bg-zinc-100"
            style={{ left: `${item.position}%` }}
          />
        </div>
      )}
    </div>
  )
}

function MultiThumbSlider({ items }: { items: readonly ReactSliderRenderItem[] }) {
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
