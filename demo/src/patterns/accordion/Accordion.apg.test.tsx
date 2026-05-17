/**
 * APG Accordion 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { Accordion } from './Accordion'
import { initialAccordionData, reduceAccordionData } from './accordionData'

function AccordionDemo() {
  const [data, setData] = useState(initialAccordionData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceAccordionData(current, event))
  return <Accordion data={data} onEvent={handleEvent} />
}

describe('APG §Roles, States, Properties', () => {
  it('each header is a button (role=button)', () => {
    render(<AccordionDemo />)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('each header sits inside a heading element', () => {
    render(<AccordionDemo />)
    screen.getAllByRole('button').forEach((btn) => {
      const heading = btn.closest('h1,h2,h3,h4,h5,h6,[role="heading"]')
      expect(heading).toBeTruthy()
    })
  })

  it('each header exposes aria-expanded', () => {
    render(<AccordionDemo />)
    screen.getAllByRole('button').forEach((btn) => {
      expect(['true', 'false']).toContain(btn.getAttribute('aria-expanded'))
    })
  })

  it('each header references its panel via aria-controls', () => {
    render(<AccordionDemo />)
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn.getAttribute('aria-controls')).toBeTruthy()
    })
  })

  it('expanded header opens the panel; aria-controls target exists', () => {
    render(<AccordionDemo />)
    const btn = screen.getAllByRole('button')[0]!
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
    const id = btn.getAttribute('aria-controls')!
    expect(document.getElementById(id)).toBeTruthy()
  })
})

describe('APG §Keyboard — Enter / Space toggle', () => {
  it('Enter toggles aria-expanded on focused header', () => {
    render(<AccordionDemo />)
    const btn = screen.getAllByRole('button')[0]!
    const before = btn.getAttribute('aria-expanded')
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
    expect(btn.getAttribute('aria-expanded')).not.toBe(before)
  })

  it('Space toggles aria-expanded on focused header', () => {
    render(<AccordionDemo />)
    const btn = screen.getAllByRole('button')[0]!
    const before = btn.getAttribute('aria-expanded')
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' })
    expect(btn.getAttribute('aria-expanded')).not.toBe(before)
  })
})
