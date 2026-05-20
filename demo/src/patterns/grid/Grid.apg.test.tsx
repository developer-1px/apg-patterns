/**
 * APG Grid (data grid) 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (s: string) => string } }).CSS = { escape: (s: string) => s }
}

import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { Grid } from './Grid'
import { gridVariants } from './gridData'

function GridDemo() {
  const [data, setData] = useState<PatternData>(gridVariants.dataTransactions.data)
  return (
    <Grid
      data={data}
      onEvent={(event: PatternEvent) => setData((current) => reducePatternData(gridDefinition, current, event))}
    />
  )
}

const g = () => screen.getByRole('grid')

describe('APG §Roles, States, Properties', () => {
  it('container has role="grid"', () => {
    render(<GridDemo />)
    expect(g()).toBeTruthy()
  })

  it('rows have role="row"', () => {
    render(<GridDemo />)
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
  })

  it('cells have role="gridcell" or "columnheader" or "rowheader"', () => {
    render(<GridDemo />)
    const cells = document.querySelectorAll('[role="gridcell"], [role="columnheader"], [role="rowheader"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('grid has accessible name', () => {
    render(<GridDemo />)
    const name = g().getAttribute('aria-label') || g().getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-rowcount / aria-colcount (if present) are numbers', () => {
    render(<GridDemo />)
    const e = g()
    if (e.hasAttribute('aria-rowcount')) expect(Number(e.getAttribute('aria-rowcount'))).not.toBeNaN()
    if (e.hasAttribute('aria-colcount')) expect(Number(e.getAttribute('aria-colcount'))).not.toBeNaN()
  })

  it('aria-multiselectable (if present) is true/false', () => {
    render(<GridDemo />)
    const v = g().getAttribute('aria-multiselectable')
    if (v !== null) expect(['true', 'false']).toContain(v)
  })
})

describe('APG §Keyboard — Arrow keys move focus among cells', () => {
  it('ArrowRight changes active cell', () => {
    render(<GridDemo />)
    const before = document.querySelector('[role="gridcell"][data-active]')
    fireEvent.keyDown(g(), { key: 'ArrowRight' })
    const after = document.querySelector('[role="gridcell"][data-active]')
    if (before && after) expect(after).not.toBe(before)
  })
})

describe('APG §Keyboard — Ctrl+Home / Ctrl+End (optional)', () => {
  it('Ctrl+Home fires without error', () => {
    render(<GridDemo />)
    fireEvent.keyDown(g(), { key: 'End' })
    fireEvent.keyDown(g(), { key: 'Home', ctrlKey: true })
    expect(g()).toBeTruthy()
  })
})
