import type { HTMLAttributes, KeyboardEvent, PointerEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, sliderDefinition, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export function Slider({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options: PatternOptions
}) {
  const runtime = createPatternRuntime({
    definition: sliderDefinition,
    data,
    options,
    onEvent,
    keyToElementId: (key) => `slider-${key}`,
  })
  const key = data.relations?.rootKeys?.[0]

  if (!key) return null

  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('slider', key) as Props
  const value = Number(data.state?.valueByKey?.[key] ?? options.min ?? 0)
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100
  const onKeyDown = runtime.getRootKeyboardHandler()
  const updateFromPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = rect.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const raw = min + ratio * (max - min)
    const next = Math.round(raw / step) * step
    onEvent({ type: 'extension', name: 'value-change', key, payload: { value: next } })
  }

  return (
    <div className="grid max-w-sm gap-3">
      <div {...props} onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })} className="grid gap-2 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500">
        <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
          <span>{data.items[key]?.label}</span>
          <span>{value}</span>
        </div>
        <div
          className="relative h-2 rounded bg-zinc-100 dark:bg-zinc-900"
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
          <div className="absolute inset-y-0 left-0 rounded bg-zinc-900 dark:bg-zinc-100" style={{ width: `${position}%` }} />
          <div className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950" style={{ left: `${position}%` }} />
        </div>
      </div>
    </div>
  )
}
