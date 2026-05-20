import { useGridPattern, type PatternData, type PatternEvent, type ReactGridCell } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'
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
    <div className="max-w-full overflow-x-auto pb-1">
      <div
        {...grid.gridProps}
        className={cx('grid min-w-max overflow-hidden rounded-xl bg-white/82 text-sm text-zinc-800 shadow-[0_12px_32px_rgba(24,24,27,0.06)] dark:bg-white/[0.045] dark:text-zinc-300 dark:shadow-black/20', ds.focusRing)}
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
      className={cx(ds.listOption, 'min-h-9 rounded-none px-2 py-2')}
    >
      {cell.editing ? (
        <input
          {...cell.editInputProps}
          className={cx('w-full rounded-md bg-white/85 px-1 shadow-inner shadow-zinc-200/60 dark:bg-white/[0.07] dark:shadow-black/20', ds.focusRing)}
        />
      ) : (
        <>{cell.value}{sortIcon ? <Icon name={sortIcon} className="ml-1 text-xs text-zinc-500" /> : null}</>
      )}
    </div>
  )
}
