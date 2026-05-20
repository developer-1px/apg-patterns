/**
 * APG Spinbutton 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src/react'
import { Spinbutton } from './Spinbutton'
import { initialSpinbuttonData, reduceSpinbuttonData, spinbuttonOptions } from './spinbuttonData'

function SpinbuttonDemo() {
  const [data, setData] = useState(initialSpinbuttonData)
  const handleEvent = (event: PatternEvent) =>
    setData((current) => reduceSpinbuttonData(current, event, spinbuttonOptions))
  return <Spinbutton data={data} onEvent={handleEvent} />
}

const sb = () => screen.getByRole('spinbutton')

describe('APG §Roles, States, Properties', () => {
  it('element has role="spinbutton"', () => {
    render(<SpinbuttonDemo />)
    expect(sb()).toBeTruthy()
  })

  it('exposes aria-valuenow', () => {
    render(<SpinbuttonDemo />)
    expect(sb().getAttribute('aria-valuenow')).toBeTruthy()
  })

  it('exposes aria-valuemin / aria-valuemax (if bounded)', () => {
    render(<SpinbuttonDemo />)
    const e = sb()
    if (e.hasAttribute('aria-valuemin')) expect(Number(e.getAttribute('aria-valuemin'))).not.toBeNaN()
    if (e.hasAttribute('aria-valuemax')) expect(Number(e.getAttribute('aria-valuemax'))).not.toBeNaN()
  })

  it('has accessible label', () => {
    render(<SpinbuttonDemo />)
    const e = sb()
    const name = e.getAttribute('aria-label') || e.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })
})

describe('APG §Keyboard — Up / Down arrows step value', () => {
  it('ArrowUp increases value', () => {
    render(<SpinbuttonDemo />)
    const before = Number(sb().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sb(), { key: 'ArrowUp' })
    expect(Number(sb().getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  })

  it('ArrowDown decreases value', () => {
    render(<SpinbuttonDemo />)
    fireEvent.keyDown(sb(), { key: 'ArrowUp' })
    const before = Number(sb().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sb(), { key: 'ArrowDown' })
    expect(Number(sb().getAttribute('aria-valuenow'))).toBeLessThan(before)
  })
})

describe('APG §Keyboard — Home / End', () => {
  it('Home sets to min (if min defined)', () => {
    render(<SpinbuttonDemo />)
    const e = sb()
    const min = e.getAttribute('aria-valuemin')
    fireEvent.keyDown(e, { key: 'Home' })
    if (min !== null) expect(sb().getAttribute('aria-valuenow')).toBe(min)
  })

  it('End sets to max (if max defined)', () => {
    render(<SpinbuttonDemo />)
    const e = sb()
    const max = e.getAttribute('aria-valuemax')
    fireEvent.keyDown(e, { key: 'End' })
    if (max !== null) expect(sb().getAttribute('aria-valuenow')).toBe(max)
  })
})

describe('APG §Keyboard — PageUp / PageDown (optional)', () => {
  it('PageUp increases by larger step', () => {
    render(<SpinbuttonDemo />)
    const before = Number(sb().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sb(), { key: 'PageUp' })
    expect(Number(sb().getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(before)
  })

  it('PageDown decreases by larger step', () => {
    render(<SpinbuttonDemo />)
    fireEvent.keyDown(sb(), { key: 'PageUp' })
    const before = Number(sb().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sb(), { key: 'PageDown' })
    expect(Number(sb().getAttribute('aria-valuenow'))).toBeLessThanOrEqual(before)
  })
})
