import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip demo', () => {
  it('trigger has aria-describedby pointing to tooltip id', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    const describedby = trigger.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    fireEvent.focus(trigger)
    const tip = screen.getByRole('tooltip')
    expect(tip.id).toBe(describedby)
  })

  it('focus shows tooltip and blur hides it', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.blur(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('mouseenter shows tooltip and mouseleave hides it', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    expect(screen.queryByRole('tooltip')).toBeNull()

    fireEvent.mouseEnter(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.mouseLeave(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('Escape hides the tooltip while focused', () => {
    render(<Tooltip />)
    const trigger = screen.getByRole('button')
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()

    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})
