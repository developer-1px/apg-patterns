import { useTreeviewPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { useTreeDomFocus } from './useTreeDomFocus'

export function Tree({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const tree = useTreeviewPattern({ data, options, onEvent })
  useTreeDomFocus(data, options?.focusStrategy)

  return (
    <div className="min-h-56 rounded-md border border-zinc-200 bg-white p-1.5 outline-none focus:outline focus:outline-2 focus:outline-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:outline-zinc-400" {...tree.getTreeProps()}>
      {tree.items.map((item) => (
        <div
          key={item.key}
          {...item.slotProps.treeitem}
          className="flex min-h-8 items-center gap-1.5 rounded px-1 text-sm text-zinc-800 outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-950 focus:outline focus:outline-2 focus:outline-zinc-500 dark:text-zinc-300 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 dark:focus:outline-zinc-400"
          style={{ paddingLeft: `${(data.state?.levelByKey?.[item.key] ?? 1) * 18}px` }}
        >
          <button
            type="button"
            {...item.slotProps.indicator}
            aria-label={`toggle ${item.key}`}
            className="h-6 w-6 rounded-md border border-zinc-200 bg-white p-0 font-mono text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {data.relations?.childrenByKey?.[item.key]?.length ? (data.state?.expandedKeys?.includes(item.key) ? '-' : '+') : ''}
          </button>
          <span>{data.items[item.key]?.label}</span>
        </div>
      ))}
    </div>
  )
}
