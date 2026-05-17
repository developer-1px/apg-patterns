import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { Button } from './Button'
import { buttonVariants } from './buttonData'

function ActionDemo({ onActivate }: { onActivate?: () => void }) {
  const variant = buttonVariants.action
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => {
    if (event.type === 'activate') onActivate?.()
    setData((current) => variant.reduce(current, event))
  }
  return <Button data={data} onEvent={handleEvent} />
}

function ToggleDemo() {
  const variant = buttonVariants.toggle
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Button data={data} onEvent={handleEvent} />
}

describe('Button demo (action)', () => {
  it('activates on click', () => {
    let count = 0
    render(<ActionDemo onActivate={() => count++} />)
    fireEvent.click(screen.getByRole('button'))
    expect(count).toBe(1)
  })

  it('activates on Enter', () => {
    let count = 0
    render(<ActionDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', code: 'Enter' })
    expect(count).toBe(1)
  })

  it('activates on Space', () => {
    let count = 0
    render(<ActionDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ', code: 'Space' })
    expect(count).toBe(1)
  })

  it('never sets aria-pressed (no toggle state)', () => {
    render(<ActionDemo />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe(null)
  })
})

describe('Button demo (toggle, aria-pressed)', () => {
  it('starts unpressed', () => {
    render(<ToggleDemo />)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles aria-pressed on click', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles aria-pressed on Enter', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('toggles aria-pressed on Space', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })
})
