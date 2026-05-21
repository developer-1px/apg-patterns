import { useSwitchPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

const itemClass = cx(ds.option, ds.checkable, 'inline-flex h-8 max-w-sm items-center gap-2 text-sm')

export function Switch({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = useSwitchPattern(data, onEvent)
  if (runtime.renderItems.length === 0) return null

  return (
    <div className="grid gap-1">
      {runtime.renderItems.map((item) => {
        const on = item.state.checked
        return (
          <div
            key={item.key}
            {...item.switchProps}
            className={itemClass}
          >
            <span
              aria-hidden="true"
              className={`relative inline-block h-4 w-7 rounded-full transition ${on ? 'bg-zinc-800 dark:bg-zinc-200' : 'bg-zinc-200 dark:bg-white/[0.1]'}`}
            >
              <span
                className={`absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white transition dark:bg-zinc-100 ${on ? 'left-3.5' : 'left-0.5'}`}
              />
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
