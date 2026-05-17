import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../src'
import { initialRadioData, reduceRadioData } from './radioData'
import { RadioGroup } from './RadioGroup'

function RadioDemo() {
  const [data, setData] = useState(initialRadioData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceRadioData(current, event))
  return <RadioGroup data={data} onEvent={handleEvent} />
}

describe('RadioGroup demo', () => {
  it('moves and checks the next radio with arrow keys', () => {
    render(<RadioDemo />)

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByRole('radio', { name: 'Pickup' }).getAttribute('aria-checked')).toBe('false')
    expect(screen.getByRole('radio', { name: 'Courier' }).getAttribute('aria-checked')).toBe('true')
  })

  it('checks a radio on click', () => {
    render(<RadioDemo />)

    fireEvent.click(screen.getByRole('radio', { name: 'Locker' }))

    expect(screen.getByRole('radio', { name: 'Pickup' }).getAttribute('aria-checked')).toBe('false')
    expect(screen.getByRole('radio', { name: 'Locker' }).getAttribute('aria-checked')).toBe('true')
  })
})
