import type { KeyInput } from '@interactive-os/keyboard'
import type { Key, PatternData, PatternEvent } from '../../src'
import { createPatternRuntime } from '../../src'

type Runtime = ReturnType<typeof createPatternRuntime>

export function MultiThumbSlider({
  data,
  onEvent,
  runtime,
  getThumbKeyDownHandler,
  min,
  max,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  runtime: Runtime
  getThumbKeyDownHandler: (key: Key) => (event: KeyInput & { preventDefault?: () => void }) => void
  min: number
  max: number
  step: number
}) {
  const rootKeys = data.relations?.rootKeys ?? []
  const [minKey, maxKey] = rootKeys
  const minValue = Number(data.state?.valueByKey?.[minKey] ?? min)
  const maxValue = Number(data.state?.valueByKey?.[maxKey] ?? max)
  const range = max - min || 1
  const minPos = ((minValue - min) / range) * 100
  const maxPos = ((maxValue - min) / range) * 100

  return (
    <div className="grid max-w-md gap-3">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>Price range</span>
        <span>${minValue} - ${maxValue}</span>
      </div>
      <div className="relative h-2 rounded bg-zinc-100 dark:bg-zinc-900">
        <div
          className="absolute inset-y-0 rounded bg-zinc-900 dark:bg-zinc-100"
          style={{ left: `${minPos}%`, width: `${Math.max(0, maxPos - minPos)}%` }}
        />
        <MultiThumbSliderThumb data={data} thumbKey={minKey} value={minValue} position={minPos} runtime={runtime} onEvent={onEvent} getThumbKeyDownHandler={getThumbKeyDownHandler} />
        <MultiThumbSliderThumb data={data} thumbKey={maxKey} value={maxValue} position={maxPos} runtime={runtime} onEvent={onEvent} getThumbKeyDownHandler={getThumbKeyDownHandler} />
      </div>
    </div>
  )
}

function MultiThumbSliderThumb({
  data,
  thumbKey,
  value,
  position,
  runtime,
  onEvent,
  getThumbKeyDownHandler,
}: {
  data: PatternData
  thumbKey: Key
  value: number
  position: number
  runtime: Runtime
  onEvent: (event: PatternEvent) => void
  getThumbKeyDownHandler: (key: Key) => (event: KeyInput & { preventDefault?: () => void }) => void
}) {
  const { onKeyDown: _drop, ...props } = runtime.getPartProps('slider', thumbKey)
  return (
    <button
      {...props}
      type="button"
      onKeyDown={(event) => {
        onEvent({ type: 'focus', key: thumbKey })
        getThumbKeyDownHandler(thumbKey)(event as unknown as KeyInput & { preventDefault?: () => void })
      }}
      onFocus={() => onEvent({ type: 'focus', key: thumbKey })}
      aria-valuenow={value}
      style={{ left: `${position}%` }}
      className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-zinc-900 bg-white outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-100 dark:bg-zinc-950"
    >
      <span className="sr-only">{(data.items[thumbKey] as { label?: string } | undefined)?.label}</span>
    </button>
  )
}
