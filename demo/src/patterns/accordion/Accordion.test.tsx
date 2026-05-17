import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src'
import { Accordion } from './Accordion'
import { initialAccordionData, reduceAccordionData } from './accordionData'

function AccordionDemo({ initial = initialAccordionData }: { initial?: PatternData }) {
  const [data, setData] = useState(initial)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceAccordionData(current, event))
  return <Accordion data={data} onEvent={handleEvent} />
}

describe('Accordion demo', () => {
  it('renders 4 headers, all collapsed; each has aria-controls pointing to a panel', () => {
    render(<AccordionDemo />)
    const headers = screen.getAllByRole('button')
    expect(headers).toHaveLength(4)
    for (const header of headers) {
      expect(header.getAttribute('aria-expanded')).toBe('false')
      const controls = header.getAttribute('aria-controls')
      expect(controls).toBeTruthy()
    }
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('clicking a header toggles aria-expanded and panel visibility', () => {
    render(<AccordionDemo />)
    const [first] = screen.getAllByRole('button')
    expect(first!.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(first!)
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    const panel = screen.getByRole('region')
    expect(panel).toBeTruthy()
    expect(panel.getAttribute('aria-labelledby')).toBe(first!.getAttribute('id'))
    expect(first!.getAttribute('aria-controls')).toBe(panel.getAttribute('id'))

    fireEvent.click(first!)
    expect(first!.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('allows multiple panels expanded at once', () => {
    render(<AccordionDemo />)
    const [first, second] = screen.getAllByRole('button')
    fireEvent.click(first!)
    fireEvent.click(second!)
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    expect(second!.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })

  it('Enter toggles the focused header', () => {
    render(<AccordionDemo />)
    const [first] = screen.getAllByRole('button')
    first!.focus()
    fireEvent.keyDown(first!, { key: 'Enter', code: 'Enter' })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(first!, { key: 'Enter', code: 'Enter' })
    expect(first!.getAttribute('aria-expanded')).toBe('false')
  })

  it('Space toggles the focused header', () => {
    render(<AccordionDemo />)
    const [first] = screen.getAllByRole('button')
    first!.focus()
    fireEvent.keyDown(first!, { key: ' ', code: 'Space' })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(first!, { key: ' ', code: 'Space' })
    expect(first!.getAttribute('aria-expanded')).toBe('false')
  })

  it('ArrowDown / ArrowUp move focus across header siblings', () => {
    render(<AccordionDemo />)
    const [first, second, third] = screen.getAllByRole('button')
    first!.focus()

    fireEvent.keyDown(first!, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(second)

    fireEvent.keyDown(second!, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(third)

    fireEvent.keyDown(third!, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(document.activeElement).toBe(second)
  })

  it('Home/End jump to first/last header', () => {
    render(<AccordionDemo />)
    const headers = screen.getAllByRole('button')
    const [first] = headers
    const last = headers[headers.length - 1]
    first!.focus()

    fireEvent.keyDown(first!, { key: 'End', code: 'End' })
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(last!, { key: 'Home', code: 'Home' })
    expect(document.activeElement).toBe(first)
  })

  it('roving tabIndex: only the active header is tabbable', () => {
    render(<AccordionDemo />)
    const [first, second] = screen.getAllByRole('button')
    expect(first!.getAttribute('tabindex')).toBe('0')
    expect(second!.getAttribute('tabindex')).toBe('-1')

    first!.focus()
    fireEvent.keyDown(first!, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })
})
