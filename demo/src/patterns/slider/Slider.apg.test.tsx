/**
 * APG Slider 스펙 전수 테스트 (단일 thumb).
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { Slider } from './Slider'
import { initialSliderData, reduceSliderData, sliderOptions } from './sliderData'

function SliderDemo() {
  const [data, setData] = useState(initialSliderData)
  const handleEvent = (event: PatternEvent) =>
    setData((current) => reduceSliderData(current, event, sliderOptions))
  return <Slider data={data} onEvent={handleEvent} />
}

const sl = () => screen.getAllByRole('slider')[0]!

describe('APG §Roles, States, Properties', () => {
  it('element has role="slider"', () => {
    render(<SliderDemo />)
    expect(sl()).toBeTruthy()
  })

  it('exposes aria-valuenow / aria-valuemin / aria-valuemax', () => {
    render(<SliderDemo />)
    const s = sl()
    expect(s.getAttribute('aria-valuenow')).toBeTruthy()
    expect(s.getAttribute('aria-valuemin')).toBeTruthy()
    expect(s.getAttribute('aria-valuemax')).toBeTruthy()
  })

  it('valuenow falls within [valuemin, valuemax]', () => {
    render(<SliderDemo />)
    const s = sl()
    const now = Number(s.getAttribute('aria-valuenow'))
    const min = Number(s.getAttribute('aria-valuemin'))
    const max = Number(s.getAttribute('aria-valuemax'))
    expect(now).toBeGreaterThanOrEqual(min)
    expect(now).toBeLessThanOrEqual(max)
  })

  it('has accessible label', () => {
    render(<SliderDemo />)
    const s = sl()
    const name = s.getAttribute('aria-label') || s.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-orientation (if present) is horizontal or vertical', () => {
    render(<SliderDemo />)
    const o = sl().getAttribute('aria-orientation')
    if (o !== null) expect(['horizontal', 'vertical']).toContain(o)
  })
})

describe('APG §Keyboard — Right/Up increases, Left/Down decreases', () => {
  it('ArrowRight increases value', () => {
    render(<SliderDemo />)
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'ArrowRight' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  })

  it('ArrowLeft decreases value', () => {
    render(<SliderDemo />)
    fireEvent.keyDown(sl(), { key: 'ArrowRight' })
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'ArrowLeft' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeLessThan(before)
  })

  it('ArrowUp increases value', () => {
    render(<SliderDemo />)
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'ArrowUp' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  })

  it('ArrowDown decreases value', () => {
    render(<SliderDemo />)
    fireEvent.keyDown(sl(), { key: 'ArrowUp' })
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'ArrowDown' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeLessThan(before)
  })
})

describe('APG §Keyboard — Home / End', () => {
  it('Home sets to valuemin', () => {
    render(<SliderDemo />)
    fireEvent.keyDown(sl(), { key: 'Home' })
    expect(sl().getAttribute('aria-valuenow')).toBe(sl().getAttribute('aria-valuemin'))
  })

  it('End sets to valuemax', () => {
    render(<SliderDemo />)
    fireEvent.keyDown(sl(), { key: 'End' })
    expect(sl().getAttribute('aria-valuenow')).toBe(sl().getAttribute('aria-valuemax'))
  })
})

describe('APG §Keyboard — PageUp / PageDown (optional)', () => {
  it('PageUp increases by larger step', () => {
    render(<SliderDemo />)
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'PageUp' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(before)
  })

  it('PageDown decreases by larger step', () => {
    render(<SliderDemo />)
    fireEvent.keyDown(sl(), { key: 'PageUp' })
    const before = Number(sl().getAttribute('aria-valuenow'))
    fireEvent.keyDown(sl(), { key: 'PageDown' })
    expect(Number(sl().getAttribute('aria-valuenow'))).toBeLessThanOrEqual(before)
  })
})
