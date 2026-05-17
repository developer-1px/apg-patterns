/**
 * APG Tooltip 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 *   1) Keyboard: Escape dismisses
 *   2) Roles: role=tooltip; trigger has aria-describedby
 *   3) Focus: tooltip does not steal focus
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

describe('APG §Roles, States, Properties', () => {
  it('tooltip element uses role="tooltip"', () => {
    render(<Tooltip />)
    fireEvent.focus(screen.getByRole('button'))
    expect(screen.getByRole('tooltip')).toBeTruthy()
  })

  it('trigger references tooltip via aria-describedby', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    const describedby = trigger.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip').id).toBe(describedby)
  })
})

describe('APG §Keyboard — Escape dismisses', () => {
  it('Escape on focused trigger hides the tooltip', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('APG §Focus — tooltip does not steal focus', () => {
  it('focus stays on trigger when tooltip shows', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    trigger.focus()
    fireEvent.focus(trigger)
    expect(document.activeElement).toBe(trigger)
  })

  it('blur on trigger dismisses focus-triggered tooltip', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    fireEvent.blur(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
