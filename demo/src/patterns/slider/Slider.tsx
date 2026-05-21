import { useSliderPattern, type PatternData, type PatternEvent, type ReactSliderRenderItem, type SliderOptions } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
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
  options?: SliderOptions
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
          className="relative h-32 w-2 rounded-full bg-zinc-100/80 shadow-inner shadow-zinc-200/70 dark:bg-white/[0.06] dark:shadow-black/20"
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
            className={`absolute left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_5px_16px_rgba(24,24,27,0.24),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:bg-zinc-100 ${thumbColorClass[String(item.key)] ?? ''}`}
            style={{ bottom: `${item.position}%` }}
          />
        </div>
      ) : (
        <div
          data-testid={`slider-track-${item.key}`}
          className="relative h-2 rounded-full bg-zinc-100/80 shadow-inner shadow-zinc-200/70 dark:bg-white/[0.06] dark:shadow-black/20"
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
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_5px_16px_rgba(24,24,27,0.24),inset_0_1px_1px_rgba(255,255,255,0.7)] dark:bg-zinc-100"
            style={{ left: `${item.position}%` }}
          />
        </div>
      )}
    </div>
  )
}
