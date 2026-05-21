/**
 * APG Toolbar 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ToolbarDemo } from './testing/ToolbarTestHost'

const tb = () => screen.getByRole('toolbar')

describe('APG §Roles, States, Properties', () => {
  it('container has role="toolbar"', () => {
    render(<ToolbarDemo />)
    expect(tb()).toBeTruthy()
  })

  it('has accessible name (aria-label or aria-labelledby)', () => {
    render(<ToolbarDemo />)
    const name = tb().getAttribute('aria-label') || tb().getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-orientation (if present) is horizontal or vertical', () => {
    render(<ToolbarDemo />)
    const o = tb().getAttribute('aria-orientation')
    if (o !== null) expect(['horizontal', 'vertical']).toContain(o)
  })
})

describe('APG §Keyboard — Roving tabindex (single tab stop)', () => {
  it('exactly one control has tabindex=0', () => {
    render(<ToolbarDemo />)
    const ti0 = screen.getAllByRole('button').filter((b) => b.getAttribute('tabindex') === '0')
    expect(ti0.length).toBe(1)
  })
})

describe('APG §Keyboard — Arrow keys move focus among controls', () => {
  it('ArrowRight moves the active control', () => {
    render(<ToolbarDemo />)
    const before = screen.getAllByRole('button').findIndex((b) => b.getAttribute('tabindex') === '0')
    fireEvent.keyDown(tb(), { key: 'ArrowRight' })
    const after = screen.getAllByRole('button').findIndex((b) => b.getAttribute('tabindex') === '0')
    expect(after).not.toBe(before)
  })

  it('ArrowLeft moves the active control back', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(tb(), { key: 'ArrowRight' })
    const mid = screen.getAllByRole('button').findIndex((b) => b.getAttribute('tabindex') === '0')
    fireEvent.keyDown(tb(), { key: 'ArrowLeft' })
    const after = screen.getAllByRole('button').findIndex((b) => b.getAttribute('tabindex') === '0')
    expect(after).not.toBe(mid)
  })
})

describe('APG §Keyboard — Home / End (optional)', () => {
  it('Home moves active to first control', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(tb(), { key: 'ArrowRight' })
    fireEvent.keyDown(tb(), { key: 'Home' })
    expect(screen.getAllByRole('button')[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('End moves active to last control', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(tb(), { key: 'End' })
    const all = screen.getAllByRole('button')
    expect(all[all.length - 1]!.getAttribute('tabindex')).toBe('0')
  })
})
