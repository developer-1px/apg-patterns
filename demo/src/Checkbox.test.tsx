import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../src'
import { Checkbox } from './Checkbox'
import { checkboxVariants, initialCheckboxData, reduceCheckboxData } from './checkboxData'

function CheckboxDemo() {
  const [data, setData] = useState(initialCheckboxData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceCheckboxData(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

function TriStateDemo() {
  const variant = checkboxVariants.triState
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Checkbox data={data} groupLabel={variant.groupLabel} onEvent={handleEvent} />
}

describe('Checkbox demo (two-state)', () => {
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

describe('Checkbox demo (tri-state / mixed)', () => {
  it('parent reflects mixed when only one child is checked', () => {
    render(<TriStateDemo />)
    const [parent, terms] = screen.getAllByRole('checkbox')

    fireEvent.click(terms!)

    expect(parent!.getAttribute('aria-checked')).toBe('mixed')
    expect(terms!.getAttribute('aria-checked')).toBe('true')
  })

  it('parent reflects true when all children are checked', () => {
    render(<TriStateDemo />)
    const [parent, terms, privacy] = screen.getAllByRole('checkbox')

    fireEvent.click(terms!)
    fireEvent.click(privacy!)

    expect(parent!.getAttribute('aria-checked')).toBe('true')
  })

  it('Space on parent checks all children when mixed/unchecked', () => {
    render(<TriStateDemo />)
    const [parent, terms, privacy] = screen.getAllByRole('checkbox')

    fireEvent.click(terms!) // mixed
    fireEvent.keyDown(parent!, { key: ' ', code: 'Space' })

    expect(parent!.getAttribute('aria-checked')).toBe('true')
    expect(terms!.getAttribute('aria-checked')).toBe('true')
    expect(privacy!.getAttribute('aria-checked')).toBe('true')
  })

  it('Space on parent unchecks all children when fully checked', () => {
    render(<TriStateDemo />)
    const [parent, terms, privacy] = screen.getAllByRole('checkbox')

    fireEvent.click(terms!)
    fireEvent.click(privacy!) // both checked, parent=true
    fireEvent.keyDown(parent!, { key: ' ', code: 'Space' })

    expect(parent!.getAttribute('aria-checked')).toBe('false')
    expect(terms!.getAttribute('aria-checked')).toBe('false')
    expect(privacy!.getAttribute('aria-checked')).toBe('false')
  })

  it('exposes a group with aria-labelledby', () => {
    render(<TriStateDemo />)
    const group = screen.getByRole('group')
    expect(group.getAttribute('aria-labelledby')).toBeTruthy()
    const labelId = group.getAttribute('aria-labelledby')!
    expect(document.getElementById(labelId)?.textContent).toBe('Conditions')
  })
})
