import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { reduceDisclosureData, type PatternData, type PatternEvent } from '../../src'
import { Disclosure } from './Disclosure'
import {
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'

function DisclosureDemo({ variant, initial }: { variant: DisclosureVariantKey; initial: PatternData }) {
  const [data, setData] = useState(initial)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceDisclosureData(current, event))
  return <Disclosure data={data} variant={variant} onEvent={handleEvent} />
}

describe('Disclosure demo (image)', () => {
  it('toggles aria-expanded and panel visibility on click', () => {
    render(<DisclosureDemo variant="image" initial={initialImageDisclosureData} />)
    const trigger = screen.getByRole('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region')).toBeTruthy()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('toggles via Enter and Space keyboard', () => {
    render(<DisclosureDemo variant="image" initial={initialImageDisclosureData} />)
    const trigger = screen.getByRole('button')

    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(trigger, { key: ' ', code: 'Space' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Disclosure demo (faq)', () => {
  it('renders 4 independent triggers with aria-controls', () => {
    render(<DisclosureDemo variant="faq" initial={initialFaqDisclosureData} />)
    const triggers = screen.getAllByRole('button')
    expect(triggers).toHaveLength(4)
    for (const trigger of triggers) {
      expect(trigger.getAttribute('aria-controls')).toBeTruthy()
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('toggles each FAQ independently', () => {
    render(<DisclosureDemo variant="faq" initial={initialFaqDisclosureData} />)
    const [first, second] = screen.getAllByRole('button')

    fireEvent.click(first!)
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    expect(second!.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getAllByRole('region')).toHaveLength(1)

    fireEvent.click(second!)
    expect(first!.getAttribute('aria-expanded')).toBe('true')
    expect(second!.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('region')).toHaveLength(2)

    fireEvent.click(first!)
    expect(first!.getAttribute('aria-expanded')).toBe('false')
    expect(second!.getAttribute('aria-expanded')).toBe('true')
  })

  it('panel id matches trigger aria-controls', () => {
    render(<DisclosureDemo variant="faq" initial={initialFaqDisclosureData} />)
    const [first] = screen.getAllByRole('button')
    fireEvent.click(first!)
    const panelId = first!.getAttribute('aria-controls')!
    expect(document.getElementById(panelId)).toBeTruthy()
  })
})

describe('Disclosure demo (navMenu)', () => {
  it('renders nav landmark and 3 top-level disclosure triggers', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('Enter opens submenu and ArrowDown focuses first link; Escape closes and returns focus', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about] = screen.getAllByRole('button')

    fireEvent.keyDown(about!, { key: 'Enter', code: 'Enter' })
    expect(about!.getAttribute('aria-expanded')).toBe('true')

    const firstLink = screen.getByRole('link', { name: 'Overview' })
    fireEvent.keyDown(about!, { key: 'ArrowDown', code: 'ArrowDown' })
    // ArrowDown when already expanded focuses first link synchronously
    expect(document.activeElement).toBe(firstLink)

    fireEvent.keyDown(firstLink, { key: 'Escape', code: 'Escape' })
    expect(about!.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(about)
  })

  it('opening a different top-level closes the previously open one (mutual exclusion)', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about, admissions] = screen.getAllByRole('button')

    fireEvent.click(about!)
    expect(about!.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(admissions!)
    expect(about!.getAttribute('aria-expanded')).toBe('false')
    expect(admissions!.getAttribute('aria-expanded')).toBe('true')
  })

  it('ArrowRight/ArrowLeft move focus across top-level siblings', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about, admissions, academics] = screen.getAllByRole('button')
    about!.focus()

    fireEvent.keyDown(about!, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(document.activeElement).toBe(admissions)

    fireEvent.keyDown(admissions!, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(document.activeElement).toBe(academics)

    fireEvent.keyDown(academics!, { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(document.activeElement).toBe(admissions)
  })

  it('ArrowDown/ArrowUp navigate sibling links within open submenu', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about] = screen.getAllByRole('button')
    fireEvent.click(about!)

    const overview = screen.getByRole('link', { name: 'Overview' })
    const history = screen.getByRole('link', { name: 'History' })
    const mission = screen.getByRole('link', { name: 'Mission' })
    overview.focus()

    fireEvent.keyDown(overview, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(history)

    fireEvent.keyDown(history, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(mission)

    fireEvent.keyDown(mission, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(document.activeElement).toBe(history)
  })
})

describe('Disclosure demo (navMenuTopLinks)', () => {
  it('plain Home/Contact are anchors without aria-expanded; groups have disclosure buttons', () => {
    render(<DisclosureDemo variant="navMenuTopLinks" initial={initialNavMenuTopLinksDisclosureData} />)
    const nav = screen.getByRole('navigation')

    const home = within(nav).getByRole('link', { name: 'Home' })
    const contact = within(nav).getByRole('link', { name: 'Contact' })
    expect(home.tagName).toBe('A')
    expect(home.hasAttribute('aria-expanded')).toBe(false)
    expect(contact.hasAttribute('aria-expanded')).toBe(false)

    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(3)
    for (const button of buttons) {
      expect(button.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('group trigger still toggles submenu while plain links remain plain', () => {
    render(<DisclosureDemo variant="navMenuTopLinks" initial={initialNavMenuTopLinksDisclosureData} />)
    const [about] = screen.getAllByRole('button')
    fireEvent.click(about!)
    expect(about!.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Overview' })).toBeTruthy()
  })
})
