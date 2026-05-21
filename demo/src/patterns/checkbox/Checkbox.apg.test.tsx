/**
 * APG Checkbox 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src/react'
import { Checkbox } from './Checkbox'
import { checkboxVariants } from './checkboxData'

function TwoStateDemo() {
  const variant = checkboxVariants.twoState
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

function TriStateDemo() {
  const variant = checkboxVariants.triState
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

describe('APG §Roles, States, Properties', () => {
  it('element has role="checkbox"', () => {
    render(<TwoStateDemo />)
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
  })

  it('exposes aria-checked (true/false for two-state)', () => {
    render(<TwoStateDemo />)
    screen.getAllByRole('checkbox').forEach((cb) => {
      expect(['true', 'false', 'mixed']).toContain(cb.getAttribute('aria-checked'))
    })
  })

  it('tri-state checkbox can be aria-checked="mixed"', () => {
    render(<TriStateDemo />)
    // Check only one child → parent should become "mixed".
    const children = screen.getAllByRole('checkbox').filter((c) => c.textContent !== 'All conditions')
    fireEvent.keyDown(children[0]!, { key: ' ', code: 'Space' })
    const states = screen.getAllByRole('checkbox').map((c) => c.getAttribute('aria-checked'))
    expect(states.some((s) => s === 'mixed')).toBe(true)
  })

  it('has accessible name', () => {
    render(<TwoStateDemo />)
    screen.getAllByRole('checkbox').forEach((cb) => {
      const name = cb.textContent || cb.getAttribute('aria-label') || cb.getAttribute('aria-labelledby')
      expect(name).toBeTruthy()
    })
  })
})

describe('APG §Keyboard — Space toggles', () => {
  it('Space flips aria-checked', () => {
    render(<TwoStateDemo />)
    const cb = screen.getAllByRole('checkbox')[0]!
    const before = cb.getAttribute('aria-checked')
    fireEvent.keyDown(cb, { key: ' ', code: 'Space' })
    expect(screen.getAllByRole('checkbox')[0]!.getAttribute('aria-checked')).not.toBe(before)
  })
})
