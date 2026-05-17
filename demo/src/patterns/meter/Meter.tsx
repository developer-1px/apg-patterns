import type { HTMLAttributes } from 'react'
import { createPatternRuntime, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { meterDefinition } from '../../../../src/patterns/meter/definition'

type Props = HTMLAttributes<HTMLElement>

export function Meter({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: meterDefinition,
    data,
    options,
    onEvent,
    keyToElementId: (key) => `meter-${key}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const containerClass = rootKeys.length > 1 ? 'grid max-w-sm gap-5' : 'grid max-w-sm gap-3'

  return (
    <div className={containerClass}>
      {rootKeys.map((key) => (
        <MeterBar key={key} meterKey={key} data={data} runtime={runtime} options={options} />
      ))}
    </div>
  )
}

function MeterBar({
  meterKey,
  data,
  runtime,
  options,
}: {
  meterKey: Key
  data: PatternData
  runtime: ReturnType<typeof createPatternRuntime>
  options: PatternOptions
}) {
  const props = runtime.getPartProps('meter', meterKey) as Props
  const item = data.items[meterKey]
  const value = Number(data.state?.valueByKey?.[meterKey] ?? 0)
  const itemRange = item as { valuemin?: number; valuemax?: number; valuetext?: string } | undefined
  const min = Number(itemRange?.valuemin ?? options.min ?? 0)
  const max = Number(itemRange?.valuemax ?? options.max ?? 100)
  const ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)))
  const percent = ratio * 100
  const valuetext = itemRange?.valuetext

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>{item?.label}</span>
        <span>{valuetext ?? value}</span>
      </div>
      <div
        {...props}
        className="relative h-2 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900"
      >
        <div className="absolute inset-y-0 left-0 rounded bg-zinc-900 dark:bg-zinc-100" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
