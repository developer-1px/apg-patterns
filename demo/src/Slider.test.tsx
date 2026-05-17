import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../src'
import { Slider } from './Slider'
import { initialSliderData, reduceSliderData, sliderOptions } from './sliderData'

function SliderDemo({ onEvent }: { onEvent?: (event: PatternEvent) => void }) {
  const [data, setData] = useState(initialSliderData)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSliderData(current, event, sliderOptions))
  }
  return <Slider data={data} options={sliderOptions} onEvent={handleEvent} />
}

describe('Slider demo', () => {
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
})
