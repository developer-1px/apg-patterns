/**
 * APG Table (static) 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/table/
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TableDemo } from './testing/TableTestHost'

describe('APG §Roles, States, Properties', () => {
  it('container has role="table"', () => {
    render(<TableDemo />)
    expect(screen.getByRole('table')).toBeTruthy()
  })

  it('rows have role="row"', () => {
    render(<TableDemo />)
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0)
  })

  it('column headers have role="columnheader"', () => {
    render(<TableDemo />)
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0)
  })

  it('data cells have role="cell" or "rowheader"', () => {
    render(<TableDemo />)
    const cells = document.querySelectorAll('[role="cell"], [role="rowheader"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('table has accessible name', () => {
    render(<TableDemo />)
    const t = screen.getByRole('table')
    const name = t.getAttribute('aria-label') || t.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-sort (if present) is valid value', () => {
    render(<TableDemo />)
    document.querySelectorAll('[aria-sort]').forEach((el) => {
      expect(['ascending', 'descending', 'none', 'other']).toContain(el.getAttribute('aria-sort'))
    })
  })
})
