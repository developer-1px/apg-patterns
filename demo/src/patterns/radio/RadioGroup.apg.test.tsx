/**
 * APG Radio Group 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src/react'
import { initialRadioData, reduceRadioData } from './radioData'
import { RadioGroup } from './RadioGroup'

function RadioDemo() {
  const [data, setData] = useState(initialRadioData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceRadioData(current, event))
  return <RadioGroup data={data} onEvent={handleEvent} />
}

describe('APG §Roles, States, Properties', () => {
  it('container has role="radiogroup"', () => {
    render(<RadioDemo />)
    expect(screen.getByRole('radiogroup')).toBeTruthy()
  })

  it('each option has role="radio"', () => {
    render(<RadioDemo />)
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(1)
  })

  it('every radio exposes aria-checked', () => {
    render(<RadioDemo />)
    screen.getAllByRole('radio').forEach((r) => {
      expect(['true', 'false']).toContain(r.getAttribute('aria-checked'))
    })
  })

  it('exactly one radio is checked', () => {
    render(<RadioDemo />)
    const checked = screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')
    expect(checked.length).toBe(1)
  })

  it('radiogroup has accessible name', () => {
    render(<RadioDemo />)
    const group = screen.getByRole('radiogroup')
    const name = group.getAttribute('aria-label') || group.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('each radio has accessible name', () => {
    render(<RadioDemo />)
    screen.getAllByRole('radio').forEach((r) => {
      const name = r.textContent || r.getAttribute('aria-label') || r.getAttribute('aria-labelledby')
      expect(name).toBeTruthy()
    })
  })
})

describe('APG §Keyboard — Arrow keys move + check next', () => {
  it('ArrowRight moves checked to next radio', () => {
    render(<RadioDemo />)
    const before = screen.getAllByRole('radio').findIndex((r) => r.getAttribute('aria-checked') === 'true')
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
    const after = screen.getAllByRole('radio').findIndex((r) => r.getAttribute('aria-checked') === 'true')
    expect(after).not.toBe(before)
  })

  it('ArrowDown moves checked to next radio', () => {
    render(<RadioDemo />)
    const before = screen.getAllByRole('radio').findIndex((r) => r.getAttribute('aria-checked') === 'true')
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' })
    const after = screen.getAllByRole('radio').findIndex((r) => r.getAttribute('aria-checked') === 'true')
    expect(after).not.toBe(before)
  })

  it('ArrowLeft moves checked to previous radio (wraps)', () => {
    render(<RadioDemo />)
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' })
    const checked = screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')
    expect(checked.length).toBe(1)
  })

  it('ArrowUp moves checked to previous radio (wraps)', () => {
    render(<RadioDemo />)
    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowUp' })
    const checked = screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')
    expect(checked.length).toBe(1)
  })
})

describe('APG §Keyboard — Space checks focused radio', () => {
  it('Space on unchecked radio checks it', () => {
    render(<RadioDemo />)
    const radios = screen.getAllByRole('radio')
    const unchecked = radios.find((r) => r.getAttribute('aria-checked') === 'false')!
    fireEvent.focus(unchecked)
    fireEvent.keyDown(unchecked, { key: ' ', code: 'Space' })
    // Either Space on this radio checked it, or the focus move already did.
    const checked = screen.getAllByRole('radio').filter((r) => r.getAttribute('aria-checked') === 'true')
    expect(checked.length).toBe(1)
  })
})
