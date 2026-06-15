import { useToolbarPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { ds } from '../../shared/designSystem'

export function Toolbar({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const toolbar = useToolbarPattern(data, onEvent)

  return (
    <div
      {...toolbar.rootProps}
      className="inline-flex gap-1 rounded-md border border-zinc-200 p-1 dark:border-white/10"
    >
      {toolbar.renderItems.map((item) => {
        if (item.kind === 'select') {
          return (
            <select {...item.itemProps} key={item.key} aria-label={item.label} className={ds.textButton}>
              <option>{item.label}</option>
            </select>
          )
        }
        if (item.kind === 'colorInput') {
          return <input {...item.itemProps} key={item.key} type="color" aria-label={item.label} className="h-8 w-10 rounded border border-zinc-200 dark:border-white/10" />
        }
        if (item.kind === 'menuButton') {
          return (
            <button
              type="button"
              {...item.itemProps}
              key={item.key}
              aria-haspopup="menu"
              className={ds.textButton}
            >
              {item.label}
            </button>
          )
        }
        return (
          <button
            type="button"
            {...item.itemProps}
            key={item.key}
            className={ds.textButton}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
