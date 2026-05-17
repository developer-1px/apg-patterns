import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../src'
import { Checkbox } from './Checkbox'
import { initialCheckboxData, reduceCheckboxData } from './checkboxData'

function CheckboxDemo() {
  const [data, setData] = useState(initialCheckboxData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceCheckboxData(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

describe('Checkbox demo', () => {
  it('toggles checked state from Space', () => {
    render(<CheckboxDemo />)

    fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ', code: 'Space' })

    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true')
  })

  it('toggles checked state from click', () => {
    render(<CheckboxDemo />)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('false')
  })
})
