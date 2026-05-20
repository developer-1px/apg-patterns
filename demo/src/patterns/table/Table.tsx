import { useTablePattern, type PatternData, type PatternEvent, type ReactTableRow } from '../../../../src'

export function Table({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const table = useTablePattern(data, onEvent)

  return (
    <div className="max-w-full overflow-x-auto rounded-xl shadow-[0_12px_32px_rgba(24,24,27,0.06)] dark:shadow-black/20">
      <table {...table.tableProps} className="min-w-max bg-white/55 text-sm text-zinc-800 dark:bg-white/[0.04] dark:text-zinc-300">
        {table.headerRow ? (
          <thead>
            <TableRow row={table.headerRow} />
          </thead>
        ) : null}
        <tbody>
          {table.bodyRows.map((row, rowIndex) => (
            <TableRow key={row.key} row={row} rowIndex={rowIndex} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableRow({ row, rowIndex }: { row: ReactTableRow; rowIndex?: number }) {
  const isStriped = rowIndex !== undefined && rowIndex % 2 === 0
  return (
    <tr {...row.rowProps} className={isStriped ? 'bg-zinc-100/35 dark:bg-white/[0.025]' : undefined}>
      {row.cells.map((cell) => {
        const Tag = cell.tag
        return (
          <Tag key={cell.key} {...cell.cellProps} className="px-3 py-2 text-left first:pl-4">
            {cell.label}
          </Tag>
        )
      })}
    </tr>
  )
}
