import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { treegridDefinition } from '../../../../src/patterns/treegrid/definition'
import { Treegrid } from './Treegrid'
import { initialTreegridData, treegridFirstCell } from './treegridData'

function TreegridDemo() {
  const [data, setData] = useState<PatternData>(initialTreegridData)
  return (
    <Treegrid
      data={data}
      onEvent={(event: PatternEvent) => {
        setData((current) => reducePatternData(treegridDefinition, current, event))
      }}
    />
  )
}

const cellOf = (key: string) => document.getElementById(`treegridcell-${key}`)!
const rowOf = (rowKey: string) =>
  Array.from(document.querySelectorAll('[role="row"]')).find(
    (el) => cellOf(treegridFirstCell(rowKey)) && el.contains(cellOf(treegridFirstCell(rowKey))),
  ) as HTMLElement | undefined

describe('Treegrid demo', () => {
  it('advertises role=treegrid with aria-rowcount and aria-colcount', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    expect(grid.getAttribute('aria-rowcount')).toBe(String(initialTreegridData.state?.rowCount))
    expect(grid.getAttribute('aria-colcount')).toBe('3')
    expect(grid.getAttribute('aria-label')).toBe('File browser')
  })

  it('exposes aria-level and aria-expanded on rows with children', () => {
    render(<TreegridDemo />)
    const srcRow = rowOf('src')!
    expect(srcRow.getAttribute('aria-level')).toBe('1')
    expect(srcRow.getAttribute('aria-expanded')).toBe('true')

    const docsRow = rowOf('docs')!
    expect(docsRow.getAttribute('aria-level')).toBe('1')
    // docs is collapsed initially.
    expect(docsRow.getAttribute('aria-expanded')).toBe('false')

    // Leaf row (pkg.json) should NOT have aria-expanded.
    const pkgRow = rowOf('pkg.json')!
    expect(pkgRow.getAttribute('aria-expanded')).toBeNull()
    expect(pkgRow.getAttribute('aria-level')).toBe('1')
  })

  it('ArrowRight on first cell of collapsed row expands the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')

    // Move to docs name cell (it's collapsed). From src:name, ArrowDown a few times.
    // src is expanded but components is collapsed → visible rows after src: components, index.ts, docs.
    for (let i = 0; i < 3; i += 1) fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(cellOf(treegridFirstCell('docs')).hasAttribute('data-active')).toBe(true)

    // ArrowRight on first cell of collapsed docs → expand.
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(rowOf('docs')!.getAttribute('aria-expanded')).toBe('true')
    expect(cellOf('readme.md:name')).toBeTruthy()
  })

  it('ArrowLeft on first cell of expanded row collapses it', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')

    // Active starts at src:name and src is expanded.
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('false')
    // Collapsed children are gone.
    expect(document.getElementById('treegridcell-components:name')).toBeNull()
  })

  it('ArrowRight on non-first cell moves right (does not expand)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')

    // From src:name go right → src:size.
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(cellOf('src:size').hasAttribute('data-active')).toBe(true)
    // src must still be expanded.
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')

    // From src:size another ArrowRight on a non-first column shouldn't toggle expansion.
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(cellOf('src:modified').hasAttribute('data-active')).toBe(true)
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
  })

  it('Home/End move within the row; Ctrl+Home/Ctrl+End jump to grid extremes', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')

    fireEvent.keyDown(grid, { key: 'End' })
    expect(cellOf('src:modified').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home' })
    expect(cellOf('src:name').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    // First visible row is the column header row, first cell is h-name.
    expect(cellOf('h-name').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    // Last visible row: pkg.json. Last column: modified.
    expect(cellOf('pkg.json:modified').hasAttribute('data-active')).toBe(true)
  })

  it('clicking a cell selects it (aria-selected=true)', () => {
    render(<TreegridDemo />)
    fireEvent.click(cellOf('components:name'))
    expect(cellOf('components:name').getAttribute('aria-selected')).toBe('true')
    // Previously selected src:name should no longer be selected.
    expect(cellOf('src:name').getAttribute('aria-selected')).not.toBe('true')
  })
})
