import { useLayoutEffect, useMemo } from 'react'
import type { HTMLAttributes } from 'react'
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
  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: sliderDefinition,
        data,
        options,
        onEvent,
        keyToElementId: (key) => `slider-${key}`,
      }),
    [data, onEvent, options],
  )
  const key = data.relations?.rootKeys?.[0]

  useLayoutEffect(() => {
    if (!key || data.state?.activeKey !== key) return
    document.getElementById(`slider-${CSS.escape(key)}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey, key])

  if (!key) return null

  const props = runtime.getPartProps('slider', key) as Props
  const value = Number(data.state?.valueByKey?.[key] ?? options.min ?? 0)
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100

  return (
    <div className="grid max-w-sm gap-3">
      <div {...props} className="grid gap-2 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500">
        <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
          <span>{data.items[key]?.label}</span>
          <span>{value}</span>
        </div>
        <div className="relative h-2 rounded bg-zinc-100 dark:bg-zinc-900">
          <div className="absolute inset-y-0 left-0 rounded bg-zinc-900 dark:bg-zinc-100" style={{ width: `${position}%` }} />
          <div className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-950" style={{ left: `${position}%` }} />
        </div>
      </div>
    </div>
  )
}
