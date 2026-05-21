/**
 * APG Tabs 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TabsDemo } from './testing/TabsTestHost'

describe('APG §Roles, States, Properties', () => {
  it('container has role="tablist"', () => {
    render(<TabsDemo />)
    expect(screen.getByRole('tablist')).toBeTruthy()
  })

  it('each tab has role="tab"', () => {
    render(<TabsDemo />)
    expect(screen.getAllByRole('tab').length).toBeGreaterThan(1)
  })

  it('a tabpanel exists with role="tabpanel"', () => {
    render(<TabsDemo />)
    expect(screen.getAllByRole('tabpanel').length).toBeGreaterThanOrEqual(1)
  })

  it('exactly one tab is aria-selected="true"', () => {
    render(<TabsDemo />)
    const selected = screen.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBe(1)
  })

  it('selected tab references its tabpanel via aria-controls', () => {
    render(<TabsDemo />)
    const tab = screen.getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true')!
    const controls = tab.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(document.getElementById(controls!)).toBeTruthy()
  })

  it('tabpanel references its tab via aria-labelledby', () => {
    render(<TabsDemo />)
    const panel = screen.getAllByRole('tabpanel')[0]!
    const labelledby = panel.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
  })

  it('tablist orientation (if present) is horizontal or vertical', () => {
    render(<TabsDemo />)
    const o = screen.getByRole('tablist').getAttribute('aria-orientation')
    if (o !== null) expect(['horizontal', 'vertical']).toContain(o)
  })
})

describe('APG §Keyboard — Arrow keys move focus among tabs', () => {
  it('ArrowRight moves selection to next tab (horizontal)', () => {
    render(<TabsDemo />)
    const tabs = screen.getAllByRole('tab')
    const before = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    const after = screen.getAllByRole('tab').findIndex((t) => t.getAttribute('aria-selected') === 'true')
    expect(after).not.toBe(before)
  })

  it('ArrowLeft wraps to last when at first', () => {
    render(<TabsDemo />)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
    const selected = screen.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBe(1)
  })
})

describe('APG §Keyboard — Home / End (optional)', () => {
  it('Home selects first tab', () => {
    render(<TabsDemo />)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' })
    expect(screen.getAllByRole('tab')[0]!.getAttribute('aria-selected')).toBe('true')
  })

  it('End selects last tab', () => {
    render(<TabsDemo />)
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' })
    const tabs = screen.getAllByRole('tab')
    expect(tabs[tabs.length - 1]!.getAttribute('aria-selected')).toBe('true')
  })
})
