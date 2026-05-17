import { useSliderPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactSliderRenderItem } from '../../../../src'
import { MultiThumbSlider } from './MultiThumbSlider'

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
      className="grid gap-2 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500"
    >
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>{item.label}</span>
        <span>{item.valueText ?? item.value}</span>
      </div>
      {isVertical ? (
        <div
          data-testid={`slider-track-${item.key}`}
          className="relative h-32 w-2 rounded bg-zinc-100 dark:bg-zinc-900"
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
          <div className="absolute inset-x-0 bottom-0 rounded bg-zinc-900 dark:bg-zinc-100" style={{ height: `${item.position}%` }} />
          <div
            className={`absolute left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full border border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950 ${thumbColorClass[String(item.key)] ?? ''}`}
            style={{ bottom: `${item.position}%` }}
          />
        </div>
      ) : (
        <div
          data-testid={`slider-track-${item.key}`}
          className="relative h-2 rounded bg-zinc-100 dark:bg-zinc-900"
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
          <div className={`absolute inset-y-0 left-0 rounded ${thumbColorClass[String(item.key)] ?? 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${item.position}%` }} />
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950"
            style={{ left: `${item.position}%` }}
          />
        </div>
      )}
    </div>
  )
}
