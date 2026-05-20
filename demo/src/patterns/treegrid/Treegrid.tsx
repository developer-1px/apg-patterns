import { useTreegridPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'

export function Treegrid({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const treegrid = useTreegridPattern(data, onEvent, options)

  return (
    <div className="max-w-full overflow-x-auto pb-1">
      <div
        {...treegrid.treegridProps}
        className={cx('grid min-w-max overflow-hidden rounded-xl bg-white/82 text-sm text-zinc-800 shadow-[0_12px_32px_rgba(24,24,27,0.06)] dark:bg-white/[0.045] dark:text-zinc-300 dark:shadow-black/20', ds.focusRing)}
        style={{ gridTemplateColumns: `repeat(${treegrid.columnCount}, minmax(120px, 1fr))` }}
      >
        {treegrid.rows.map((row) => (
          <div key={row.key} {...row.rowProps} className="contents">
            {row.cells.map((cell) => (
              <div
                key={cell.key}
                {...cell.cellProps}
                data-active={cell.state.active ? '' : undefined}
                className={cx(ds.listOption, 'min-h-8 rounded-none px-2 py-1')}
                style={cell.indent ? { paddingLeft: `${8 + cell.indent}px` } : undefined}
              >
                {cell.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
