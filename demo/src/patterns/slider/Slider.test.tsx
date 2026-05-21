import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternDataSchema, type PatternEvent } from '../../../../src/react'
import { Slider } from './Slider'
import { reduceSliderData, sliderVariants } from './sliderData'

function SliderDemo({ onEvent, variant }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof sliderVariants }) {
  const init = sliderVariants[variant ?? 'seek']
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSliderData(current, event, init.options))
  }
  return <Slider data={data} onEvent={handleEvent} options={init.options} />
}

function SliderReducerEdgesDemo() {
  const [data, setData] = useState(sliderVariants.range.data)
  const apply = (event: PatternEvent) => setData((current) => reduceSliderData(current, event, sliderVariants.range.options))
  const applyTemperature = (event: PatternEvent) =>
    setData(() => reduceSliderData(sliderVariants.temperature.data, event, sliderVariants.temperature.options))
  const applyFallback = (event: PatternEvent) =>
    setData(() =>
      reduceSliderData(
        {
          items: { loose: { label: 'Loose value' } },
          relations: { rootKeys: ['loose'] },
          state: { activeKey: 'loose', valueByKey: {} },
        },
        event,
        { focusStrategy: 'rovingTabIndex' },
      ),
    )
  const applyCustomText = (event: PatternEvent) =>
    setData(() =>
      reduceSliderData(
        {
          items: { custom: { label: 'Custom', valuetext: 'Custom text' } },
          relations: { rootKeys: ['custom'] },
          state: { activeKey: 'custom', valueByKey: { custom: 1 } },
        },
        event,
        sliderVariants.seek.options,
      ),
    )
  const applyMin = (event: PatternEvent) =>
    setData(() =>
      reduceSliderData(
        {
          ...sliderVariants.range.data,
          items: {
            min: { label: 'Minimum price', valuemin: 0, valuemax: 500 },
            max: { label: 'Maximum price', valuemin: 200, valuemax: 500 },
          },
          state: { ...sliderVariants.range.data.state, activeKey: 'min', valueByKey: { min: 200, max: 400 } },
        },
        event,
        sliderVariants.range.options,
      ),
    )

  return (
    <div>
      <button type="button" onClick={() => apply({ type: 'value', key: 'max', value: 390 })}>Move max down</button>
      <button type="button" onClick={() => applyMin({ type: 'value', key: 'min', value: 210 })}>Move min up</button>
      <button type="button" onClick={() => apply({ type: 'valueStep', key: 'min', direction: 'unknown' } as unknown as PatternEvent)}>Unknown step</button>
      <button type="button" onClick={() => apply({ type: 'dismiss' })}>Ignored event</button>
      <button type="button" onClick={() => applyTemperature({ type: 'value', key: 'temp', value: 'ignored' })}>String temperature</button>
      <button type="button" onClick={() => applyFallback({ type: 'valueStep', key: 'loose', direction: 'increment' })}>Fallback range</button>
      <button type="button" onClick={() => applyCustomText({ type: 'value', key: 'custom', value: 2 })}>Custom valuetext</button>
      <output data-testid="slider-active">{String(data.state?.activeKey ?? '')}</output>
      <output data-testid="slider-min">{String(data.state?.valueByKey?.min ?? '')}</output>
      <output data-testid="slider-max">{String(data.state?.valueByKey?.max ?? '')}</output>
      <output data-testid="slider-temp">{String(data.state?.valueByKey?.temp ?? '')}</output>
      <output data-testid="slider-loose">{String(data.state?.valueByKey?.loose ?? '')}</output>
      <output data-testid="slider-custom-text">{String(data.items.custom?.valuetext ?? '')}</output>
      <output data-testid="slider-min-max">{String(data.items.min?.valuemax ?? '')}</output>
      <output data-testid="slider-max-min">{String(data.items.max?.valuemin ?? '')}</output>
    </div>
  )
}

describe('Slider demo — variant: Media Seek', () => {
  it('renders nothing when no slider thumb is present', () => {
    const emptyData = PatternDataSchema.parse({ items: {}, relations: { rootKeys: [] }, state: {} })
    render(<Slider data={emptyData} onEvent={() => undefined} />)

    expect(screen.queryByRole('slider')).toBeNull()
  })

  it('updates value from keyboard events', () => {
    render(<SliderDemo />)

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'F13', code: 'F13' })
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('45')

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('46')
    expect(screen.getByText('0:46')).toBeTruthy()
  })

  it('updates value from pointer position', () => {
    render(<SliderDemo />)
    const track = screen.getByRole('slider').querySelector('.relative') as HTMLElement
    track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 8, width: 200, height: 8, toJSON: () => ({}) })

    fireEvent.pointerDown(track, { clientX: 150, pointerId: 1 })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('225')
    expect(screen.getByText('3:45')).toBeTruthy()
  })

  it('ignores horizontal pointer move unless dragging', () => {
    render(<SliderDemo />)
    const track = screen.getByRole('slider').querySelector('.relative') as HTMLElement
    track.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 8, width: 200, height: 8, toJSON: () => ({}) })

    fireEvent.pointerMove(track, { clientX: 180, buttons: 0, pointerId: 1 })

    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('45')
  })

  it('Home/End jump to min/max', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'End', code: 'End' })
    expect(slider.getAttribute('aria-valuenow')).toBe('300')
    fireEvent.keyDown(slider, { key: 'Home', code: 'Home' })
    expect(slider.getAttribute('aria-valuenow')).toBe('0')
  })

  it('PageUp/PageDown change by ~10% of range', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    // 45 -> +30 = 75
    fireEvent.keyDown(slider, { key: 'PageUp', code: 'PageUp' })
    expect(slider.getAttribute('aria-valuenow')).toBe('75')
    fireEvent.keyDown(slider, { key: 'PageDown', code: 'PageDown' })
    expect(slider.getAttribute('aria-valuenow')).toBe('45')
  })

  it('Shift+ArrowRight applies large step', () => {
    render(<SliderDemo />)
    const slider = screen.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight', shiftKey: true })
    expect(slider.getAttribute('aria-valuenow')).toBe('75')
  })

  it('handles a zero range slider without moving its position', () => {
    const zeroRangeData = PatternDataSchema.parse({
      items: { fixed: { label: 'Fixed', valuemin: 5, valuemax: 5 } },
      relations: { rootKeys: ['fixed'] },
      state: { activeKey: 'fixed', valueByKey: { fixed: 5 } },
    })
    render(<Slider data={zeroRangeData} onEvent={() => undefined} />)

    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuenow')).toBe('5')
    expect(screen.getByTestId('slider-track-fixed').firstElementChild?.getAttribute('style')).toContain('width: 0%')
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

  it('covers reducer edge cases from pointer controls', () => {
    render(<SliderReducerEdgesDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Move max down' }))
    expect(screen.getByTestId('slider-max').textContent).toBe('390')
    expect(screen.getByTestId('slider-min-max').textContent).toBe('390')

    fireEvent.click(screen.getByRole('button', { name: 'Move min up' }))
    expect(screen.getByTestId('slider-min').textContent).toBe('210')
    expect(screen.getByTestId('slider-max-min').textContent).toBe('210')

    fireEvent.click(screen.getByRole('button', { name: 'Unknown step' }))
    expect(screen.getByTestId('slider-min').textContent).toBe('210')

    fireEvent.click(screen.getByRole('button', { name: 'Ignored event' }))
    expect(screen.getByTestId('slider-min').textContent).toBe('210')

    fireEvent.click(screen.getByRole('button', { name: 'String temperature' }))
    expect(screen.getByTestId('slider-active').textContent).toBe('temp')
    expect(screen.getByTestId('slider-temp').textContent).toBe('21')

    fireEvent.click(screen.getByRole('button', { name: 'Fallback range' }))
    expect(screen.getByTestId('slider-loose').textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'Custom valuetext' }))
    expect(screen.getByTestId('slider-custom-text').textContent).toBe('Custom text')
  })
})
