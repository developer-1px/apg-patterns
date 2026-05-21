import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useButtonPattern, type PatternEvent } from '../../../../src/react'
import { Button } from './Button'
import { buttonVariants } from './buttonData'
import { ActionButtonDemo, ToggleButtonDemo } from './testing/ButtonTestHost'

function ButtonActionsDemo() {
  const variant = buttonVariants.toggle
  const [data, setData] = useState(variant.data)
  const button = useButtonPattern(data, (event) => setData((current) => variant.reduce(current, event)))

  return (
    <div>
      <button {...button.rootProps}>{button.label}</button>
      <button type="button" onClick={() => button.actions.focus()}>Focus action</button>
      <button type="button" onClick={() => button.actions.press(true)}>Press action</button>
      <button type="button" onClick={() => button.actions.activate()}>Activate action</button>
      <output>{String(button.state.pressed)}</output>
    </div>
  )
}

describe('Button demo (action)', () => {
  it('activates on click', () => {
    let count = 0
    render(<ActionButtonDemo onActivate={() => count++} />)
    fireEvent.click(screen.getByRole('button'))
    expect(count).toBe(1)
  })

  it('activates on Enter', () => {
    let count = 0
    render(<ActionButtonDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', code: 'Enter' })
    expect(count).toBe(1)
  })

  it('activates on Space', () => {
    let count = 0
    render(<ActionButtonDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ', code: 'Space' })
    expect(count).toBe(1)
  })

  it('never sets aria-pressed (no toggle state)', () => {
    render(<ActionButtonDemo />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe(null)
  })
})

describe('Button demo (toggle, aria-pressed)', () => {
  it('starts unpressed', () => {
    render(<ToggleButtonDemo />)
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles aria-pressed on click', () => {
    render(<ToggleButtonDemo />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('toggles aria-pressed on Enter', () => {
    render(<ToggleButtonDemo />)
    const btn = screen.getByRole('button')
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('toggles aria-pressed on Space', () => {
    render(<ToggleButtonDemo />)
    const btn = screen.getByRole('button')
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' })
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('exposes disabled state while still receiving pointer input in the demo host', () => {
    const variant = buttonVariants.toggle
    const data = {
      ...variant.data,
      state: {
        ...variant.data.state,
        disabledKeys: ['mute'],
      },
    }
    const events: PatternEvent[] = []

    render(<Button data={data} onEvent={(event) => events.push(event)} />)

    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(btn)
    expect(events.length).toBeGreaterThan(0)
  })

  it('imperative actions emit focus, press, and activate from pointer controls', () => {
    render(<ButtonActionsDemo />)
    const controls = screen.getAllByRole('button')

    fireEvent.click(controls[1]!)
    fireEvent.click(controls[2]!)
    expect(screen.getByText('true')).toBeTruthy()

    fireEvent.click(controls[3]!)
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy()
  })
})
