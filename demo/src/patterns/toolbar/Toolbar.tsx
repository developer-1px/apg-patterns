import { useToolbarPattern, type PatternData, type PatternEvent } from '../../../../src'
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
      className="inline-flex gap-1 rounded-xl bg-zinc-100/75 p-1 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10"
    >
      {toolbar.renderItems.map((item) => {
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
