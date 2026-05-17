import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

// jsdom lacks the CSS object Grid.tsx uses for CSS.escape; polyfill minimally.
if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}
import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { Grid } from './Grid'
import { gridVariants, type GridVariantKey } from './gridData'

function GridDemo({ variant }: { variant: GridVariantKey }) {
  const [data, setData] = useState<PatternData>(gridVariants[variant].data)
  return (
    <Grid
      data={data}
      onEvent={(event: PatternEvent) => {
        if (event.type === 'sort') {
          setData((current) => ({ ...current, state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key]: event.sort } } }))
          return
        }
        setData((current) => reducePatternData(gridDefinition, current, event))
      }}
    />
  )
}

const cellOf = (key: string) => document.getElementById(`gridcell-${key}`)!

describe('Grid demo (layoutLinks)', () => {
  it('advertises rowcount, colcount, and aria-readonly', () => {
    render(<GridDemo variant="layoutLinks" />)
    const grid = screen.getByRole('grid')
    expect(grid.getAttribute('aria-rowcount')).toBe('2')
    expect(grid.getAttribute('aria-colcount')).toBe('3')
    expect(grid.getAttribute('aria-readonly')).toBe('true')
    expect(grid.getAttribute('aria-label')).toBe('Related Documents')
  })

  it('moves active cell with ArrowRight then ArrowDown', () => {
    render(<GridDemo variant="layoutLinks" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(cellOf('core').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(cellOf('html').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(cellOf('wcag').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(cellOf('aria').hasAttribute('data-active')).toBe(true)
  })
})

describe('Grid demo (dataTransactions)', () => {
  it('Home/End move to row start/end; Ctrl+Home/End to grid extremes', () => {
    render(<GridDemo variant="dataTransactions" />)
    const grid = screen.getByRole('grid')

    // Active starts at c12. End -> c13.
    fireEvent.keyDown(grid, { key: 'End' })
    expect(cellOf('c13').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home' })
    expect(cellOf('c11').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    expect(cellOf('c33').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(cellOf('hDate').hasAttribute('data-active')).toBe(true)
  })

  it('click selects a cell (aria-selected=true)', () => {
    render(<GridDemo variant="dataTransactions" />)

    fireEvent.click(cellOf('c22'))
    expect(cellOf('c22').getAttribute('aria-selected')).toBe('true')
    // Previously selected c12 should no longer be selected (single-select).
    expect(cellOf('c12').getAttribute('aria-selected')).not.toBe('true')
  })

  it('exposes aria-rowindex/aria-colindex on cells', () => {
    render(<GridDemo variant="dataTransactions" />)
    expect(cellOf('c22').getAttribute('aria-rowindex')).toBe('3')
    expect(cellOf('c22').getAttribute('aria-colindex')).toBe('2')
  })
})

describe('Grid demo (dataSortable)', () => {
  it('clicking a header toggles aria-sort ascending -> descending', () => {
    render(<GridDemo variant="dataSortable" />)
    const header = cellOf('hName')
    expect(header.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('descending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })

  it('clicking an unsorted header sets ascending', () => {
    render(<GridDemo variant="dataSortable" />)
    const header = cellOf('hDistance')
    expect(header.getAttribute('aria-sort')).toBeNull()

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })
})

describe('Grid demo (dataEditable)', () => {
  it('does NOT advertise aria-readonly', () => {
    render(<GridDemo variant="dataEditable" />)
    expect(screen.getByRole('grid').getAttribute('aria-readonly')).toBeNull()
  })

  it('F2 enters edit mode and Enter commits a new value', () => {
    render(<GridDemo variant="dataEditable" />)
    const grid = screen.getByRole('grid')
    // Initial active is e11 ("Ada")
    expect(cellOf('e11').textContent).toBe('Ada')

    fireEvent.keyDown(grid, { key: 'F2' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    expect(input).toBeTruthy()

    fireEvent.change(input, { target: { value: 'Augusta' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    expect(cellOf('e11').textContent).toBe('Augusta')
  })

  it('Enter on an editable cell enters edit mode; Escape cancels without committing', () => {
    render(<GridDemo variant="dataEditable" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'Enter' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    expect(input).toBeTruthy()

    fireEvent.change(input, { target: { value: 'CHANGED' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    expect(cellOf('e11').textContent).toBe('Ada')
  })
})

describe('Grid demo (dataAdvanced, multi-select)', () => {
  it('advertises aria-multiselectable', () => {
    render(<GridDemo variant="dataAdvanced" />)
    expect(screen.getByRole('grid').getAttribute('aria-multiselectable')).toBe('true')
    expect(screen.getByRole('grid').getAttribute('aria-colcount')).toBe('4')
  })

  it('clicking cells updates aria-selected (multi-select grid)', () => {
    render(<GridDemo variant="dataAdvanced" />)
    // av11 starts active+selected.
    expect(cellOf('av11').getAttribute('aria-selected')).toBe('true')

    fireEvent.click(cellOf('av22'))
    expect(cellOf('av22').getAttribute('aria-selected')).toBe('true')

    fireEvent.click(cellOf('av13'))
    expect(cellOf('av13').getAttribute('aria-selected')).toBe('true')
  })
})

describe('Grid demo (layoutButtons) PageDown/PageUp', () => {
  it('PageDown jumps down up to 5 rows (clamped to last row)', () => {
    render(<GridDemo variant="layoutButtons" />)
    const grid = screen.getByRole('grid')
    // Active starts at play (row1, col2).
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(cellOf('pause').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'PageUp' })
    expect(cellOf('play').hasAttribute('data-active')).toBe(true)
  })
})
