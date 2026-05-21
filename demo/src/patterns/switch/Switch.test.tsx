import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SwitchDemo } from './testing/SwitchTestHost'

describe('Switch demo', () => {
  it('toggles aria-checked on Space', () => {
    render(<SwitchDemo />)
    const sw = screen.getByRole('switch')
    expect(sw.getAttribute('aria-checked')).toBe('false')

    fireEvent.keyDown(sw, { key: ' ', code: 'Space' })
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')

    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ', code: 'Space' })
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  }, 15000)

  it('toggles aria-checked on Enter', () => {
    render(<SwitchDemo />)
    const sw = screen.getByRole('switch')

    fireEvent.keyDown(sw, { key: 'Enter', code: 'Enter' })
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')

    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter', code: 'Enter' })
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })

  it('toggles aria-checked on click', () => {
    render(<SwitchDemo />)

    fireEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')

    fireEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
  })
})
