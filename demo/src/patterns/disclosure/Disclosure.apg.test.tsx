/**
 * APG Disclosure 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 *   1) Keyboard: Enter / Space toggle visibility
 *   2) Roles, States: role=button on trigger, aria-expanded
 *   3) Properties (Optional): aria-controls
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DisclosureDemo } from './testing/DisclosureTestHost'

describe('APG §Roles, States, Properties', () => {
  it('trigger has role="button"', () => {
    render(<DisclosureDemo />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('trigger has aria-expanded', () => {
    render(<DisclosureDemo />)
    expect(['true', 'false']).toContain(screen.getByRole('button').getAttribute('aria-expanded'))
  })

  it('aria-expanded=false when content hidden', () => {
    render(<DisclosureDemo />)
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('aria-expanded=true when content shown', () => {
    render(<DisclosureDemo />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeTruthy()
  })

  it('aria-controls (if present) references the content element id', () => {
    render(<DisclosureDemo />)
    const trigger = screen.getByRole('button')
    const controls = trigger.getAttribute('aria-controls')
    if (controls) {
      fireEvent.click(trigger)
      expect(document.getElementById(controls)).toBeTruthy()
    }
  })
})

describe('APG §Keyboard — Enter toggles', () => {
  it('Enter on focused trigger toggles aria-expanded', () => {
    render(<DisclosureDemo />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('APG §Keyboard — Space toggles', () => {
  it('Space on focused trigger toggles aria-expanded', () => {
    render(<DisclosureDemo />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(trigger, { key: ' ', code: 'Space' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})
