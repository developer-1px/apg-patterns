import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternDataSchema, type PatternEvent } from '../../../../src'
import { Spinbutton } from './Spinbutton'
import { formatTime, initialSpinbuttonData, reduceSpinbuttonData, spinbuttonOptions, spinbuttonVariants } from './spinbuttonData'

function SpinbuttonDemo({ onEvent, variant }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof spinbuttonVariants }) {
  const init = variant ? spinbuttonVariants[variant] : { data: initialSpinbuttonData, options: spinbuttonOptions }
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSpinbuttonData(current, event, init.options))
  }
  return <Spinbutton data={data} onEvent={handleEvent} />
}

function SpinbuttonReducerEdgesDemo() {
  const [data, setData] = useState(spinbuttonVariants.time.data)
  const apply = (event: PatternEvent) => setData((current) => reduceSpinbuttonData(current, event, spinbuttonVariants.time.options))
  const applyFallback = (event: PatternEvent) =>
    setData(() =>
      reduceSpinbuttonData(
        {
          ...initialSpinbuttonData,
          items: { loose: { label: 'Loose value' } },
          relations: { rootKeys: ['loose'] },
          state: { activeKey: 'loose', valueByKey: {} },
        },
        event,
        { focusStrategy: 'rovingTabIndex' },
      ),
    )

  return (
    <div>
      <button type="button" onClick={() => apply({ type: 'focus', key: 'minutes' })}>Focus minutes</button>
      <button type="button" onClick={() => apply({ type: 'value', key: 'hours', value: 'ignored' })}>String value</button>
      <button type="button" onClick={() => apply({ type: 'valueStep', key: 'hours', direction: 'decrementLarge' })}>Large decrement</button>
      <button type="button" onClick={() => apply({ type: 'valueStep', key: 'hours', direction: 'unknown' } as unknown as PatternEvent)}>Unknown step</button>
      <button type="button" onClick={() => apply({ type: 'valueStep', key: 'hours', direction: 'incrementLarge' })}>Large increment</button>
      <button type="button" onClick={() => apply({ type: 'value', key: 'hours', value: 1 })}>Singular hour</button>
      <button type="button" onClick={() => applyFallback({ type: 'valueStep', key: 'loose', direction: 'increment' })}>Fallback range</button>
      <button type="button" onClick={() => apply({ type: 'dismiss' })}>Ignored event</button>
      <button type="button" onClick={() => apply({ type: 'value', key: 'minutes', value: 1 })}>Singular minute</button>
      <output data-testid="spin-active">{String(data.state?.activeKey ?? '')}</output>
      <output data-testid="spin-hours">{String(data.state?.valueByKey?.hours ?? '')}</output>
      <output data-testid="spin-loose">{String(data.state?.valueByKey?.loose ?? '')}</output>
      <output data-testid="spin-hour-text">{String(data.items.hours?.valuetext ?? '')}</output>
      <output data-testid="spin-minute-text">{String(data.items.minutes?.valuetext ?? '')}</output>
      <output data-testid="spin-time">{formatTime(3, 4)}</output>
    </div>
  )
}

describe('Spinbutton — numeric variant', () => {
  it('renders nothing when no spinbutton item is present', () => {
    const emptyData = PatternDataSchema.parse({ items: {}, relations: { rootKeys: [] }, state: {} })

    render(<Spinbutton data={emptyData} onEvent={() => undefined} />)

    expect(screen.queryByRole('spinbutton')).toBeNull()
  })

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

  it('uses item-level value range and labelledby when provided', () => {
    const data = {
      ...initialSpinbuttonData,
      items: {
        ...initialSpinbuttonData.items,
        count: {
          ...initialSpinbuttonData.items.count,
          labelledBy: 'quantity-label',
          valuemin: 2,
          valuemax: 8,
          valuetext: 'five items',
        },
      },
    }

    render(
      <>
        <span id="quantity-label">Quantity label</span>
        <Spinbutton data={data} onEvent={() => undefined} />
      </>,
    )

    const sb = screen.getByRole('spinbutton')
    expect(sb.getAttribute('aria-labelledby')).toBe('quantity-label')
    expect(sb.getAttribute('aria-valuemin')).toBe('2')
    expect(sb.getAttribute('aria-valuemax')).toBe('8')
    expect(sb.getAttribute('aria-valuetext')).toBe('five items')
    fireEvent.keyDown(sb, { key: 'ArrowUp', code: 'ArrowUp' })
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

  it('covers reducer edge cases from pointer controls', () => {
    render(<SpinbuttonReducerEdgesDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Focus minutes' }))
    expect(screen.getByTestId('spin-active').textContent).toBe('minutes')

    fireEvent.click(screen.getByRole('button', { name: 'String value' }))
    expect(screen.getByTestId('spin-hours').textContent).toBe('9')

    fireEvent.click(screen.getByRole('button', { name: 'Large decrement' }))
    expect(screen.getByTestId('spin-hours').textContent).toBe('3')
    expect(screen.getByTestId('spin-hour-text').textContent).toBe('3 hours')

    fireEvent.click(screen.getByRole('button', { name: 'Unknown step' }))
    expect(screen.getByTestId('spin-hours').textContent).toBe('3')

    fireEvent.click(screen.getByRole('button', { name: 'Large increment' }))
    expect(screen.getByTestId('spin-hours').textContent).toBe('9')

    fireEvent.click(screen.getByRole('button', { name: 'Singular hour' }))
    expect(screen.getByTestId('spin-hour-text').textContent).toBe('1 hour')

    fireEvent.click(screen.getByRole('button', { name: 'Singular minute' }))
    expect(screen.getByTestId('spin-minute-text').textContent).toBe('1 minute')
    expect(screen.getByTestId('spin-time').textContent).toBe('03:04')

    fireEvent.click(screen.getByRole('button', { name: 'Fallback range' }))
    expect(screen.getByTestId('spin-loose').textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'Ignored event' }))
    expect(screen.getByTestId('spin-loose').textContent).toBe('1')
  })
})
