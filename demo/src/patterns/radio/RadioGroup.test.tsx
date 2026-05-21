import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadioDemo } from './testing/RadioTestHost'

describe('RadioGroup demo', () => {
  it('moves and checks the next radio with arrow keys', () => {
    render(<RadioDemo />)

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByRole('radio', { name: 'Pickup' }).getAttribute('aria-checked')).toBe('false')
    expect(screen.getByRole('radio', { name: 'Courier' }).getAttribute('aria-checked')).toBe('true')
  })

  it('checks a radio on click', () => {
    render(<RadioDemo />)

    fireEvent.click(screen.getByRole('radio', { name: 'Locker' }))

    expect(screen.getByRole('radio', { name: 'Pickup' }).getAttribute('aria-checked')).toBe('false')
    expect(screen.getByRole('radio', { name: 'Locker' }).getAttribute('aria-checked')).toBe('true')
  })
})
