import { useMeterPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactMeterRenderItem } from '../../../../src/react'

export function Meter({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const meter = useMeterPattern(data, onEvent, options)
  if (meter.renderItems.length === 0) return null

  const containerClass = meter.renderItems.length > 1 ? 'grid max-w-sm gap-5' : 'grid max-w-sm gap-3'

  return (
    <div className={containerClass}>
      {meter.renderItems.map((item) => (
        <MeterBar key={item.key} item={item} />
      ))}
    </div>
  )
}

function MeterBar({ item }: { item: ReactMeterRenderItem }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-200">
        <span>{item.label}</span>
        <span>{item.valueText ?? item.value}</span>
      </div>
      <div
        {...item.meterProps}
        className="relative h-2 overflow-hidden rounded-full bg-zinc-100/80 dark:bg-white/[0.06]"
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${item.percent}%` }} />
      </div>
    </div>
  )
}
