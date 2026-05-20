import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternDataWithOptions, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactTableCell } from './tableRow'
import { useTablePattern } from './useTablePattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface TableProps<TItem extends PatternItem = PatternItem> {
  data: PatternDataWithOptions<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCell?: (cell: ReactTableCell, dataItem: TItem) => ReactNode
}

export function Table<TItem extends PatternItem = PatternItem>({ data, onEvent = () => undefined, options, className, renderCell }: TableProps<TItem>) {
  const table = useTablePattern(data, onEvent, options)

  return createElement(
    'div',
    { ...table.tableProps, className } as DivProps,
    table.rows.map((row) =>
      createElement(
        'div',
        { key: row.key, ...row.rowProps } as DivProps & { key: Key },
        row.cells.map((cell) =>
          createElement('div', { key: cell.key, ...cell.cellProps } as DivProps & { key: Key }, renderCell?.(cell, data.items[cell.key]) ?? cell.label),
        ),
      ),
    ),
  )
}
