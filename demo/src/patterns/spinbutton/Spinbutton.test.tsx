import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { Spinbutton } from './Spinbutton'
import { initialSpinbuttonData, reduceSpinbuttonData, spinbuttonOptions, spinbuttonVariants } from './spinbuttonData'

function SpinbuttonDemo({ onEvent, variant }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof spinbuttonVariants }) {
  const init = variant ? spinbuttonVariants[variant] : { data: initialSpinbuttonData, options: spinbuttonOptions }
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSpinbuttonData(current, event, init.options))
  }
  return <Spinbutton data={data} onEvent={handleEvent} />
}

describe('Spinbutton — numeric variant', () => {
  it('renders with role=spinbutton and aria-valuenow', () => {
    render(<SpinbuttonDemo />)
    const sb = screen.getByRole('spinbutton')
    expect(sb.getAttribute('aria-valuenow')).toBe('5')
    expect(sb.getAttribute('aria-valuemin')).toBe('0')
    expect(sb.getAttribute('aria-valuemax')).toBe('100')
  })

  it('ArrowUp increments by 1, ArrowDown decrements by 1', () => {
    render(<SpinbuttonDemo />)
    const sb = screen.getByRole('spinbutton')
    fireEvent.keyDown(sb, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(sb.getAttribute('aria-valuenow')).toBe('6')
    fireEvent.keyDown(sb, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(sb.getAttribute('aria-valuenow')).toBe('5')
  })

  it('PageUp / PageDown change by ~10% of range', () => {
    render(<SpinbuttonDemo />)
    const sb = screen.getByRole('spinbutton')
    fireEvent.keyDown(sb, { key: 'PageUp', code: 'PageUp' })
    expect(sb.getAttribute('aria-valuenow')).toBe('15')
    fireEvent.keyDown(sb, { key: 'PageDown', code: 'PageDown' })
    expect(sb.getAttribute('aria-valuenow')).toBe('5')
  })

  it('Home / End jump to min / max', () => {
    render(<SpinbuttonDemo />)
    const sb = screen.getByRole('spinbutton')
    fireEvent.keyDown(sb, { key: 'End', code: 'End' })
    expect(sb.getAttribute('aria-valuenow')).toBe('100')
    fireEvent.keyDown(sb, { key: 'Home', code: 'Home' })
    expect(sb.getAttribute('aria-valuenow')).toBe('0')
  })

  it('clicking increment/decrement buttons changes value', () => {
    render(<SpinbuttonDemo />)
    const sb = screen.getByRole('spinbutton')
    fireEvent.click(screen.getByRole('button', { name: /increment/i }))
    expect(sb.getAttribute('aria-valuenow')).toBe('6')
    fireEvent.click(screen.getByRole('button', { name: /decrement/i }))
    expect(sb.getAttribute('aria-valuenow')).toBe('5')
  })
})

describe('Spinbutton — time picker variant', () => {
  it('renders two spinbuttons (hours and minutes)', () => {
    render(<SpinbuttonDemo variant="time" />)
    const fields = screen.getAllByRole('spinbutton')
    expect(fields).toHaveLength(2)
    const [hours, minutes] = fields
    expect(hours.getAttribute('aria-valuenow')).toBe('9')
    expect(hours.getAttribute('aria-valuemax')).toBe('23')
    expect(minutes.getAttribute('aria-valuenow')).toBe('30')
    expect(minutes.getAttribute('aria-valuemax')).toBe('59')
  })

  it('emits aria-valuetext for time fields', () => {
    render(<SpinbuttonDemo variant="time" />)
    const [hours, minutes] = screen.getAllByRole('spinbutton')
    expect(hours.getAttribute('aria-valuetext')).toContain('9')
    expect(minutes.getAttribute('aria-valuetext')).toContain('30')
  })

  it('ArrowUp on minutes only changes minutes', () => {
    render(<SpinbuttonDemo variant="time" />)
    const [hours, minutes] = screen.getAllByRole('spinbutton')
    fireEvent.keyDown(minutes, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(minutes.getAttribute('aria-valuenow')).toBe('31')
    expect(hours.getAttribute('aria-valuenow')).toBe('9')
  })

  it('End jumps minutes to its own valuemax (59), not options.max', () => {
    render(<SpinbuttonDemo variant="time" />)
    const [, minutes] = screen.getAllByRole('spinbutton')
    fireEvent.keyDown(minutes, { key: 'End', code: 'End' })
    expect(minutes.getAttribute('aria-valuenow')).toBe('59')
  })

  it('Home on hours jumps to 0', () => {
    render(<SpinbuttonDemo variant="time" />)
    const [hours] = screen.getAllByRole('spinbutton')
    fireEvent.keyDown(hours, { key: 'Home', code: 'Home' })
    expect(hours.getAttribute('aria-valuenow')).toBe('0')
  })
})
