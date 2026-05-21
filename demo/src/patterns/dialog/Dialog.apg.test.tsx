/**
 * APG Modal Dialog 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DialogDemo } from './testing/DialogTestHost'

const openDialog = () => {
  const trigger = screen.getByRole('button', { name: /add delivery address/i })
  fireEvent.click(trigger)
  return trigger
}

describe('APG §Roles, States, Properties', () => {
  it('container has role="dialog"', () => {
    render(<DialogDemo />)
    openDialog()
    expect(screen.getByRole('dialog')).toBeTruthy()
  }, 15000)

  it('aria-modal="true"', () => {
    render(<DialogDemo />)
    openDialog()
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
  })

  it('aria-labelledby references visible title', () => {
    render(<DialogDemo />)
    openDialog()
    const labelledby = screen.getByRole('dialog').getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    expect(document.getElementById(labelledby!)).toBeTruthy()
  })

  it('aria-describedby (if present) references existing element', () => {
    render(<DialogDemo />)
    openDialog()
    const d = screen.getByRole('dialog').getAttribute('aria-describedby')
    if (d) expect(document.getElementById(d)).toBeTruthy()
  })
})

describe('APG §Keyboard — Escape closes', () => {
  it('Escape on open dialog closes it', () => {
    render(<DialogDemo />)
    openDialog()
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('APG §Focus management', () => {
  it('focus moves inside dialog on open', () => {
    render(<DialogDemo />)
    openDialog()
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })
})
