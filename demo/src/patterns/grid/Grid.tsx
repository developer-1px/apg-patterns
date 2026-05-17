import { useGridPattern, type PatternData, type PatternEvent, type ReactGridCell } from '../../../../src'
import { Icon, type IconName } from '../../shared/Icon'

export function Grid({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const grid = useGridPattern(data, onEvent)

  return (
    <div
      {...grid.gridProps}
      className="inline-grid overflow-hidden rounded-xl bg-white/82 text-sm text-zinc-800 shadow-[0_12px_32px_rgba(24,24,27,0.06)] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 dark:bg-white/[0.045] dark:text-zinc-300 dark:shadow-black/20 dark:focus-visible:outline-zinc-500"
      style={{ gridTemplateColumns: `repeat(${grid.columnCount}, minmax(120px, 1fr))` }}
    >
      {grid.rows.map((row) => (
        <div key={row.key} {...row.rowProps} className="contents">
          {row.cells.map((cell) => (
            <GridCell key={cell.key} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  )
}

function GridCell({ cell }: { cell: ReactGridCell }) {
  const sortIcon: IconName | null = cell.sort ? (cell.sort === 'ascending' ? 'arrow-up' : 'arrow-down') : null

  return (
    <div
      {...cell.cellProps}
      data-active={cell.state.active ? '' : undefined}
      data-editable={cell.editable ? '' : undefined}
      className="min-h-9 px-2 py-2 outline-none aria-selected:bg-zinc-100/90 aria-selected:text-zinc-950 data-active:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 dark:aria-selected:bg-white/[0.08] dark:aria-selected:text-zinc-50 dark:data-active:bg-white/[0.05] dark:focus-visible:outline-zinc-500"
    >
      {cell.editing ? (
        <input
          {...cell.editInputProps}
          className="w-full rounded-md bg-white/85 px-1 shadow-inner shadow-zinc-200/60 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-400 dark:bg-white/[0.07] dark:shadow-black/20 dark:focus-visible:outline-zinc-500"
        />
      ) : (
        <>{cell.value}{sortIcon ? <Icon name={sortIcon} className="ml-1 text-xs text-zinc-500" /> : null}</>
      )}
    </div>
  )
}
