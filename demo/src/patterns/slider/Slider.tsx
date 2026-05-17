import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, sliderDefinition, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { MultiThumbSlider } from './MultiThumbSlider'

type Props = HTMLAttributes<HTMLElement>

const thumbColorClass: Record<string, string> = {
  red: 'bg-red-500',
  green: 'bg-emerald-500',
  blue: 'bg-blue-500',
}

export function Slider({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: sliderDefinition,
    data,
    options,
    onEvent,
    keyToElementId: (key) => `slider-${key}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const orientation = options.orientation === 'vertical' ? 'vertical' : 'horizontal'
  // Per-thumb handler — uses the thumb's own key as activeKey instead of reading
  // global state.activeKey (which lags behind focus events within a single event tick).
  const getThumbKeyDownHandler = (key: Key) => (event: KeyInput & { preventDefault?: () => void }) => {
    const result = runtime.resolveKeyboardBinding(event, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault?.()
    for (const ev of result.events) onEvent(ev)
  }

  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)

  const isMultiThumb = rootKeys.length >= 2 && rootKeys.every((k) => {
    const item = data.items[k] as { valuemin?: number; valuemax?: number } | undefined
    return typeof item?.valuemin === 'number' || typeof item?.valuemax === 'number'
  })

  // Multi-thumb (range) renders a shared track with two thumbs.
  if (isMultiThumb) {
    return <MultiThumbSlider data={data} onEvent={onEvent} runtime={runtime} getThumbKeyDownHandler={getThumbKeyDownHandler} min={min} max={max} step={step} />
  }

  const containerClass = rootKeys.length > 1 ? 'grid max-w-sm gap-5' : 'grid max-w-sm gap-3'

  return (
    <div className={containerClass}>
      {rootKeys.map((key) => (
        <ThumbSlider
          key={key}
          thumbKey={key}
          data={data}
          runtime={runtime}
          options={options}
          onEvent={onEvent}
          onKeyDown={getThumbKeyDownHandler(key)}
          orientation={orientation}
          min={min}
          max={max}
          step={step}
        />
      ))}
    </div>
  )
}

function ThumbSlider({
  thumbKey,
  data,
  runtime,
  options,
  onEvent,
  onKeyDown,
  orientation,
  min,
  max,
  step,
}: {
  thumbKey: Key
  data: PatternData
  runtime: ReturnType<typeof createPatternRuntime>
  options: PatternOptions
  onEvent: (event: PatternEvent) => void
  onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => void
  orientation: 'horizontal' | 'vertical'
  min: number
  max: number
  step: number
}) {
  void options
  const { onKeyDown: _drop, ...props } = runtime.getPartProps('slider', thumbKey) as Props
  const value = Number(data.state?.valueByKey?.[thumbKey] ?? min)
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100
  const item = data.items[thumbKey]
  const valuetext = (item as { valuetext?: string } | undefined)?.valuetext

  const isVertical = orientation === 'vertical'

  const updateFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = isVertical
      ? rect.height <= 0 ? 0 : Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
      : rect.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const raw = min + ratio * (max - min)
    const next = Math.round(raw / step) * step
    onEvent({ type: 'value', key: thumbKey, value: next })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onEvent({ type: 'focus', key: thumbKey })
    onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
  }

  return (
    <div
      {...props}
      onKeyDown={handleKeyDown}
      onFocus={() => onEvent({ type: 'focus', key: thumbKey })}
      className="grid gap-2 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
    >
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>{item?.label}</span>
        <span>{valuetext ?? value}</span>
      </div>
      {isVertical ? (
        <div
          data-testid={`slider-track-${thumbKey}`}
          className="relative h-32 w-2 rounded-full bg-zinc-100/80 shadow-inner shadow-zinc-200/60 dark:bg-white/[0.06] dark:shadow-black/10"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId)
            event.currentTarget.parentElement?.focus({ preventScroll: true })
            updateFromPointer(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            updateFromPointer(event)
          }}
        >
          <div className="absolute inset-x-0 bottom-0 rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ height: `${position}%` }} />
          <div
            className={`absolute left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-[0_4px_14px_rgba(24,24,27,0.24)] ring-1 ring-black/10 dark:bg-zinc-100 dark:ring-white/10 ${thumbColorClass[String(thumbKey)] ?? ''}`}
            style={{ bottom: `${position}%` }}
          />
        </div>
      ) : (
        <div
          data-testid={`slider-track-${thumbKey}`}
          className="relative h-2 rounded-full bg-zinc-100/80 shadow-inner shadow-zinc-200/60 dark:bg-white/[0.06] dark:shadow-black/10"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId)
            event.currentTarget.parentElement?.focus({ preventScroll: true })
            updateFromPointer(event)
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return
            updateFromPointer(event)
          }}
        >
          <div className={`absolute inset-y-0 left-0 rounded-full ${thumbColorClass[String(thumbKey)] ?? 'bg-zinc-900 dark:bg-zinc-100'}`} style={{ width: `${position}%` }} />
          <div
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_4px_14px_rgba(24,24,27,0.24)] ring-1 ring-black/10 dark:bg-zinc-100 dark:ring-white/10"
            style={{ left: `${position}%` }}
          />
        </div>
      )}
    </div>
  )
}
