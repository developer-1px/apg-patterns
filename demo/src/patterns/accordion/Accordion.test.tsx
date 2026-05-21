import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useAccordionPattern } from '../../../../src/react'
import { initialAccordionData, reduceAccordionData } from './accordionData'
import { AccordionDemo } from './testing/AccordionTestHost'

function AccordionActionsDemo() {
  const [data, setData] = useState(initialAccordionData)
  const accordion = useAccordionPattern(data, (event) => setData((current) => reduceAccordionData(current, event)))
  const [first, second] = accordion.renderItems

  return (
    <div {...accordion.rootProps}>
      <button {...first!.headerProps}>{first!.label}</button>
      <button {...second!.headerProps}>{second!.label}</button>
      <button type="button" onClick={() => accordion.actions.focus(second!.key)}>Focus second</button>
      <button type="button" onClick={() => accordion.actions.expand(first!.key)}>Expand first</button>
      <button type="button" onClick={() => accordion.actions.toggle(first!.key)}>Toggle first</button>
      <button type="button" onClick={() => accordion.actions.collapse(first!.key)}>Collapse first</button>
      <output>{accordion.state.activeKey}</output>
      <output>{accordion.state.expandedKeys.join(',')}</output>
      <output>{accordion.state.disabledKeys.join(',')}</output>
    </div>
  )
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

    act(() => { fireEvent.click(first!) })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    const panel = screen.getByRole('region')
    expect(panel).toBeTruthy()
    expect(panel.getAttribute('aria-labelledby')).toBe(first!.getAttribute('id'))
    expect(first!.getAttribute('aria-controls')).toBe(panel.getAttribute('id'))

    act(() => { fireEvent.click(first!) })
    expect(first!.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('allows multiple panels expanded at once', () => {
    render(<AccordionDemo />)
    const [first, second] = screen.getAllByRole('button')
    act(() => { fireEvent.click(first!) })
    act(() => { fireEvent.click(second!) })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    expect(second!.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })

  it('Enter toggles the focused header', () => {
    render(<AccordionDemo />)
    const [first] = screen.getAllByRole('button')
    first!.focus()
    act(() => { fireEvent.keyDown(first!, { key: 'Enter', code: 'Enter' }) })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    act(() => { fireEvent.keyDown(first!, { key: 'Enter', code: 'Enter' }) })
    expect(first!.getAttribute('aria-expanded')).toBe('false')
  })

  it('Space toggles the focused header', () => {
    render(<AccordionDemo />)
    const [first] = screen.getAllByRole('button')
    first!.focus()
    act(() => { fireEvent.keyDown(first!, { key: ' ', code: 'Space' }) })
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    act(() => { fireEvent.keyDown(first!, { key: ' ', code: 'Space' }) })
    expect(first!.getAttribute('aria-expanded')).toBe('false')
  })

  it('ArrowDown / ArrowUp move focus across header siblings', () => {
    render(<AccordionDemo />)
    const [first, second, third] = screen.getAllByRole('button')
    first!.focus()

    act(() => { fireEvent.keyDown(first!, { key: 'ArrowDown', code: 'ArrowDown' }) })
    expect(document.activeElement).toBe(second)

    act(() => { fireEvent.keyDown(second!, { key: 'ArrowDown', code: 'ArrowDown' }) })
    expect(document.activeElement).toBe(third)

    act(() => { fireEvent.keyDown(third!, { key: 'ArrowUp', code: 'ArrowUp' }) })
    expect(document.activeElement).toBe(second)
  })

  it('Home/End jump to first/last header', () => {
    render(<AccordionDemo />)
    const headers = screen.getAllByRole('button')
    const [first] = headers
    const last = headers[headers.length - 1]
    first!.focus()

    act(() => { fireEvent.keyDown(first!, { key: 'End', code: 'End' }) })
    expect(document.activeElement).toBe(last)

    act(() => { fireEvent.keyDown(last!, { key: 'Home', code: 'Home' }) })
    expect(document.activeElement).toBe(first)
  })

  it('roving tabIndex: only the active header is tabbable', () => {
    render(<AccordionDemo />)
    const [first, second] = screen.getAllByRole('button')
    expect(first!.getAttribute('tabindex')).toBe('0')
    expect(second!.getAttribute('tabindex')).toBe('-1')

    first!.focus()
    act(() => { fireEvent.keyDown(first!, { key: 'ArrowDown', code: 'ArrowDown' }) })
    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })

  it('imperative actions update accordion state from pointer controls', () => {
    render(<AccordionActionsDemo />)
    const controls = screen.getAllByRole('button')

    fireEvent.click(controls[2]!)
    expect(screen.getByText('billing')).toBeTruthy()

    fireEvent.click(controls[3]!)
    expect(screen.getByText('personal')).toBeTruthy()

    fireEvent.click(controls[4]!)
    expect(screen.queryByText('personal')).toBeNull()

    fireEvent.click(controls[5]!)
    expect(screen.queryByText('personal')).toBeNull()
  })
})
