import { useTreegridPattern, type PatternData, type PatternEvent } from '../../../../src'

export function Treegrid({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const treegrid = useTreegridPattern(data, onEvent)

  return (
    <div
      {...treegrid.treegridProps}
      className="inline-grid overflow-hidden rounded-xl bg-white/80 text-sm text-zinc-800 shadow-sm shadow-zinc-200/70 ring-1 ring-black/[0.03] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 dark:bg-white/[0.04] dark:text-zinc-300 dark:shadow-black/20 dark:ring-white/[0.05] dark:focus-visible:outline-zinc-500"
      style={{ gridTemplateColumns: `repeat(${treegrid.columnCount}, minmax(120px, 1fr))` }}
    >
      {treegrid.rows.map((row) => (
        <div key={row.key} {...row.rowProps} className="contents">
          {row.cells.map((cell) => (
            <div
              key={cell.key}
              {...cell.cellProps}
              data-active={cell.state.active ? '' : undefined}
              className="min-h-8 px-2 py-1 outline-none aria-selected:bg-zinc-100/90 data-active:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 dark:aria-selected:bg-white/[0.08] dark:data-active:bg-white/[0.05] dark:focus-visible:outline-zinc-500"
              style={cell.indent ? { paddingLeft: `${8 + cell.indent}px` } : undefined}
            >
              {cell.value}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
