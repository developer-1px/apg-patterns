/**
 * APG Switch 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SwitchDemo } from './testing/SwitchTestHost'

describe('APG §Roles, States, Properties', () => {
  it('element has role="switch"', () => {
    render(<SwitchDemo />)
    expect(screen.getAllByRole('switch').length).toBeGreaterThan(0)
  })

  it('exposes aria-checked', () => {
    render(<SwitchDemo />)
    screen.getAllByRole('switch').forEach((sw) => {
      expect(['true', 'false']).toContain(sw.getAttribute('aria-checked'))
    })
  })

  it('has accessible name', () => {
    render(<SwitchDemo />)
    screen.getAllByRole('switch').forEach((sw) => {
      const name = sw.textContent || sw.getAttribute('aria-label') || sw.getAttribute('aria-labelledby')
      expect(name).toBeTruthy()
    })
  })
})

describe('APG §Keyboard — Space toggles', () => {
  it('Space flips aria-checked', () => {
    render(<SwitchDemo />)
    const sw = screen.getAllByRole('switch')[0]!
    const before = sw.getAttribute('aria-checked')
    fireEvent.keyDown(sw, { key: ' ', code: 'Space' })
    expect(screen.getAllByRole('switch')[0]!.getAttribute('aria-checked')).not.toBe(before)
  })
})

describe('APG §Keyboard — Enter toggles (optional)', () => {
  it('Enter flips aria-checked', () => {
    render(<SwitchDemo />)
    const sw = screen.getAllByRole('switch')[0]!
    const before = sw.getAttribute('aria-checked')
    fireEvent.keyDown(sw, { key: 'Enter', code: 'Enter' })
    expect(screen.getAllByRole('switch')[0]!.getAttribute('aria-checked')).not.toBe(before)
  })
})
