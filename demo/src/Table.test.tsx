import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { reducePatternData, type PatternData, type PatternEvent } from '../../src'
import { tableDefinition } from '../../src/patterns/table/definition'
import { Table } from './Table'
import { tableVariants, type TableVariantKey } from './tableData'

function TableDemo({ variant }: { variant: TableVariantKey }) {
  const [data, setData] = useState<PatternData>(tableVariants[variant].data)
  return (
    <Table
      data={data}
      onEvent={(event: PatternEvent) => {
        if (event.type === 'extension' && event.name === 'tableSort' && event.key) {
          const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
          setData((current) => ({
            ...current,
            state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key as string]: next } },
          }))
          return
        }
        setData((current) => reducePatternData(tableDefinition, current, event))
      }}
    />
  )
}

const cellOf = (key: string) => document.getElementById(`tablecell-${key}`)!

describe('Table demo (basic)', () => {
  it('exposes role=table with rowcount/colcount and aria-label', () => {
    render(<TableDemo variant="basic" />)
    const table = screen.getByRole('table')
    expect(table.getAttribute('aria-rowcount')).toBe('4')
    expect(table.getAttribute('aria-colcount')).toBe('3')
    expect(table.getAttribute('aria-label')).toBe('Transactions')
  })

  it('renders columnheader / rowheader / cell roles', () => {
    render(<TableDemo variant="basic" />)
    expect(cellOf('hDate').getAttribute('role')).toBe('columnheader')
    expect(cellOf('r1Date').getAttribute('role')).toBe('rowheader')
    expect(cellOf('r1Type').getAttribute('role')).toBe('cell')
  })

  it('exposes aria-rowindex / aria-colindex on cells', () => {
    render(<TableDemo variant="basic" />)
    expect(cellOf('r2Type').getAttribute('aria-rowindex')).toBe('3')
    expect(cellOf('r2Type').getAttribute('aria-colindex')).toBe('2')
  })

  it('clicking a columnheader toggles aria-sort (static — header drives the sort signal)', () => {
    render(<TableDemo variant="basic" />)
    const header = cellOf('hDate')
    expect(header.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('descending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })

  it('clicking an unsorted columnheader sets ascending', () => {
    render(<TableDemo variant="basic" />)
    const header = cellOf('hType')
    expect(header.getAttribute('aria-sort')).toBeNull()

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })
})
