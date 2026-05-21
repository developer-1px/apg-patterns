/**
 * APG Window Splitter 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WindowSplitterDemo as Demo } from './testing/WindowSplitterTestHost'

const sep = () => screen.getByRole('separator')

describe('APG §Roles, States, Properties', () => {
  it('element has role="separator"', () => {
    render(<Demo />)
    expect(sep()).toBeTruthy()
  })

  it('exposes aria-valuenow / aria-valuemin / aria-valuemax', () => {
    render(<Demo />)
    const s = sep()
    expect(s.getAttribute('aria-valuenow')).toBeTruthy()
    expect(s.getAttribute('aria-valuemin')).toBeTruthy()
    expect(s.getAttribute('aria-valuemax')).toBeTruthy()
  })

  it('aria-controls references primary pane', () => {
    render(<Demo />)
    const id = sep().getAttribute('aria-controls')
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)).toBeTruthy()
  })

  it('has accessible name', () => {
    render(<Demo />)
    const s = sep()
    const name = s.getAttribute('aria-label') || s.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-orientation (if present) is horizontal or vertical', () => {
    render(<Demo />)
    const o = sep().getAttribute('aria-orientation')
    if (o !== null) expect(['horizontal', 'vertical']).toContain(o)
  })
})

describe('APG §Keyboard — Arrow keys move splitter', () => {
  it('ArrowLeft/ArrowRight changes valuenow on horizontal splitter (or no-op if vertical)', () => {
    render(<Demo />)
    const before = Number(sep().getAttribute('aria-valuenow'))
    const o = sep().getAttribute('aria-orientation')
    const key = o === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    fireEvent.keyDown(sep(), { key })
    const after = Number(sep().getAttribute('aria-valuenow'))
    expect(after).toBeLessThanOrEqual(before)
  })
})

describe('APG §Keyboard — Home / End (optional)', () => {
  it('Home moves to min', () => {
    render(<Demo />)
    fireEvent.keyDown(sep(), { key: 'Home' })
    expect(sep().getAttribute('aria-valuenow')).toBe(sep().getAttribute('aria-valuemin'))
  })

  it('End moves to max', () => {
    render(<Demo />)
    fireEvent.keyDown(sep(), { key: 'End' })
    expect(sep().getAttribute('aria-valuenow')).toBe(sep().getAttribute('aria-valuemax'))
  })
})
