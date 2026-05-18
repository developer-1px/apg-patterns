import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternDataSchema, type PatternEvent } from '../../../../src'
import { Slider } from './Slider'
import { initialSliderData, reduceSliderData, sliderOptions, sliderVariants } from './sliderData'

function SliderDemo({ onEvent, variant }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof sliderVariants }) {
  const init = variant ? sliderVariants[variant] : { data: initialSliderData, options: sliderOptions }
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSliderData(current, event, init.options))
  }
  return <Slider data={data} onEvent={handleEvent} />
}

describe('Slider demo — back-compat (single thumb volume)', () => {
  it('renders nothing when no slider thumb is present', () => {
    const emptyData = PatternDataSchema.parse({ items: {}, relations: { rootKeys: [] }, state: {} })
    render(<Slider data={emptyData} onEvent={() => undefined} />)

    expect(screen.queryByRole('slider')).toBeNull()
  })

  it('updates value from keyboard events', () => {
    render(<SliderDemo />)

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('55')
    expect(screen.getByText('55')).toBeTruthy()
  })

  it('updates value from pointer position', () => {
    render(<SliderDemo />)
    const track = screen.getByRole('slider').querySelector('.relative') as HTMLElement
    track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 8, width: 200, height: 8, toJSON: () => ({}) })

    fireEvent.pointerDown(track, { clientX: 150, pointerId: 1 })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('75')
    expect(screen.getByText('75')).toBeTruthy()
  })

  it('ignores horizontal pointer move unless dragging', () => {
    render(<SliderDemo />)
    const track = screen.getByRole('slider').querySelector('.relative') as HTMLElement
    track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 8, width: 200, height: 8, toJSON: () => ({}) })

    fireEvent.pointerMove(track, { clientX: 180, buttons: 0, pointerId: 1 })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('50')
  })

  it('Home/End jump to min/max', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'End', code: 'End' })
    expect(slider.getAttribute('aria-valuenow')).toBe('100')
    fireEvent.keyDown(slider, { key: 'Home', code: 'Home' })
    expect(slider.getAttribute('aria-valuenow')).toBe('0')
  })

  it('PageUp/PageDown change by ~10% of range', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    // 50 → +10 = 60
    fireEvent.keyDown(slider, { key: 'PageUp', code: 'PageUp' })
    expect(slider.getAttribute('aria-valuenow')).toBe('60')
    fireEvent.keyDown(slider, { key: 'PageDown', code: 'PageDown' })
    expect(slider.getAttribute('aria-valuenow')).toBe('50')
  })

  it('Shift+ArrowRight applies large step', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight', shiftKey: true })
    expect(slider.getAttribute('aria-valuenow')).toBe('60')
  })
})

describe('Slider demo — variant: Color Viewer', () => {
  it('renders three sliders (R/G/B) with independent values', () => {
    render(<SliderDemo variant="color" />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)
    expect(sliders[0].getAttribute('aria-valuemin')).toBe('0')
    expect(sliders[0].getAttribute('aria-valuemax')).toBe('255')
    const values = sliders.map((s) => s.getAttribute('aria-valuenow'))
    expect(values).toEqual(['128', '200', '64'])
  })

  it('arrow key on focused thumb only changes that thumb', () => {
    render(<SliderDemo variant="color" />)
    const [red, green] = screen.getAllByRole('slider')
    fireEvent.keyDown(green, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(green.getAttribute('aria-valuenow')).toBe('201')
    expect(red.getAttribute('aria-valuenow')).toBe('128')
  })
})

describe('Slider demo — variant: Vertical Temperature', () => {
  it('emits aria-orientation=vertical and aria-valuetext', () => {
    render(<SliderDemo variant="temperature" />)
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-orientation')).toBe('vertical')
    expect(slider.getAttribute('aria-valuetext')).toContain('21')
    fireEvent.keyDown(slider, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(slider.getAttribute('aria-valuenow')).toBe('22')
    expect(slider.getAttribute('aria-valuetext')).toContain('22')
  })

  it('updates vertical value from pointer drag only while pressed', () => {
    render(<SliderDemo variant="temperature" />)
    const slider = screen.getByRole('slider')
    const track = screen.getByTestId('slider-track-temp')
    track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 8, bottom: 200, width: 8, height: 200, toJSON: () => ({}) })

    fireEvent.pointerMove(track, { clientY: 20, buttons: 0, pointerId: 1 })
    expect(slider.getAttribute('aria-valuenow')).toBe('21')

    fireEvent.pointerDown(track, { clientY: 50, pointerId: 1 })
    expect(Number(slider.getAttribute('aria-valuenow'))).toBeGreaterThan(20)

    fireEvent.pointerMove(track, { clientY: 150, buttons: 1, pointerId: 1 })
    expect(Number(slider.getAttribute('aria-valuenow'))).toBeLessThan(20)
  })
})

describe('Slider demo — variant: Rating', () => {
  it('uses textual valuetext on top of numeric value', () => {
    render(<SliderDemo variant="rating" />)
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuenow')).toBe('5')
    expect(slider.getAttribute('aria-valuetext')).toBe('Neutral')
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(slider.getAttribute('aria-valuenow')).toBe('6')
    expect(slider.getAttribute('aria-valuetext')).toBe('Neutral, leaning positive')
  })
})

describe('Slider demo — variant: Media Seek', () => {
  it('renders time valuetext (mm:ss)', () => {
    render(<SliderDemo variant="seek" />)
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuetext')).toBe('0:45')
    fireEvent.keyDown(slider, { key: 'End', code: 'End' })
    expect(slider.getAttribute('aria-valuetext')).toBe('5:00')
  })
})

describe('Slider demo — variant: Multi-Thumb Range', () => {
  it('renders two sliders with mutually-constraining valuemin/valuemax', () => {
    render(<SliderDemo variant="range" />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    const [min, max] = sliders
    expect(min.getAttribute('aria-valuenow')).toBe('200')
    expect(max.getAttribute('aria-valuenow')).toBe('400')
    // min's valuemax matches max's current value (200), so moving the min thumb up bumps against 200
    expect(min.getAttribute('aria-valuemax')).toBe('200')
    expect(max.getAttribute('aria-valuemin')).toBe('200')
  })

  it('moving the max thumb up updates its sibling min thumb valuemax constraint', () => {
    render(<SliderDemo variant="range" />)
    const [, max] = screen.getAllByRole('slider')
    // increase max by 10 (step=10) → 410
    fireEvent.keyDown(max, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(max.getAttribute('aria-valuenow')).toBe('410')
    // min thumb's valuemax should still reflect max's value (now 410)
    const [minAfter] = screen.getAllByRole('slider')
    expect(minAfter.getAttribute('aria-valuemax')).toBe('410')
  })

  it('each thumb is independently labelled', () => {
    render(<SliderDemo variant="range" />)
    const [min, max] = screen.getAllByRole('slider')
    expect(within(min).getByText(/Minimum price/i)).toBeTruthy()
    expect(within(max).getByText(/Maximum price/i)).toBeTruthy()
  })
})
