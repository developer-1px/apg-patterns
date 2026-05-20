import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { createDisclosureRuntime, reduceDisclosureData, type PatternData, type PatternEvent } from '../../../../src/react'
import { Disclosure } from './Disclosure'
import {
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'
import { useNavMenuKeyboard } from './useNavMenuKeyboard'

function DisclosureDemo({ initial }: { variant: DisclosureVariantKey; initial: PatternData }) {
  const [data, setData] = useState(initial)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceDisclosureData(current, event))
  return <Disclosure data={data} onEvent={handleEvent} />
}

function DisclosureRuntimeDemo() {
  const [data, setData] = useState(initialImageDisclosureData)
  const runtime = createDisclosureRuntime({
    data,
    options: { elementIdPrefix: 'runtime-disclosure-' },
    onEvent: (event) => setData((current) => reduceDisclosureData(current, event)),
  })
  return (
    <div onKeyDown={runtime.getRootKeyboardHandler()}>
      <button {...runtime.getTriggerProps()}>
        {data.items[runtime.triggerKey ?? '']?.label ?? 'Details'}
      </button>
      {runtime.expanded ? <section {...runtime.getPanelProps()}>Runtime panel</section> : null}
    </div>
  )
}

function NavMenuKeyboardEdgesDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<string[]>([])
  const { onButtonKey, onLinkKey } = useNavMenuKeyboard({
    containerRef,
    expandedKeys: ['about'],
    onEvent: (event) => setEvents((current) => [...current, `${event.type}:${'key' in event ? event.key ?? '' : ''}:${'expanded' in event ? event.expanded : ''}`]),
  })

  return (
    <div ref={containerRef}>
      <button type="button" data-nav-button="about" data-nav-key="about" onKeyDown={onButtonKey('about')}>About</button>
      <button type="button" data-nav-button="admissions" data-nav-key="admissions" onKeyDown={onButtonKey('admissions')}>Admissions</button>
      <button type="button" data-nav-button="empty" data-nav-key="empty" onKeyDown={onButtonKey('empty')}>Empty</button>
      <button type="button" onKeyDown={onButtonKey('ghost')}>Ghost</button>
      <div data-nav-panel="about">
        <a href="#one" onKeyDown={onLinkKey('about')}>One</a>
        <a href="#two" onKeyDown={onLinkKey('about')}>Two</a>
      </div>
      <a href="#outside" onKeyDown={onLinkKey('about')}>Outside</a>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('One'), { key: 'ArrowUp', code: 'ArrowUp' })}>Wrap link previous</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('One'), { key: 'Home', code: 'Home' })}>Ignore link key</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Two'), { key: 'ArrowDown', code: 'ArrowDown' })}>Wrap link next</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Outside'), { key: 'ArrowDown', code: 'ArrowDown' })}>Missing link index</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('About'), { key: 'ArrowUp', code: 'ArrowUp' })}>Focus last link</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Empty'), { key: 'ArrowUp', code: 'ArrowUp' })}>Focus missing last link</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Admissions'), { key: 'ArrowUp', code: 'ArrowUp' })}>Arrow up collapsed</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('About'), { key: 'Escape', code: 'Escape' })}>Escape expanded</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Admissions'), { key: 'Escape', code: 'Escape' })}>Escape collapsed</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Admissions'), { key: 'ArrowLeft', code: 'ArrowLeft' })}>Move previous</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('About'), { key: 'PageDown', code: 'PageDown' })}>Ignore button key</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('About'), { key: 'ArrowRight', code: 'ArrowRight' })}>Move next expanded</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByText('Ghost'), { key: 'ArrowRight', code: 'ArrowRight' })}>Move missing index</button>
      <output data-testid="nav-events">{events.join('|')}</output>
    </div>
  )
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

  it('standalone runtime exposes trigger and panel props for keyboard and pointer input', () => {
    render(<DisclosureRuntimeDemo />)
    const trigger = screen.getByRole('button')

    expect(trigger.id).toMatch(/^runtime-disclosure-/)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('region')).toBeNull()

    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('region').id).toBe(trigger.getAttribute('aria-controls'))

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('Disclosure demo (faq)', () => {
  it('falls back to simple disclosure when no variant is present', () => {
    const data: PatternData = {
      items: { details: { label: 'More details' } },
      relations: { rootKeys: ['details'] },
      state: {},
    }

    render(<Disclosure data={data} onEvent={() => undefined} />)

    expect(screen.getByRole('button', { name: /More details/ }).getAttribute('aria-expanded')).toBe('false')
  })

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

  it('ignores unrelated FAQ key presses and skips unknown FAQ rows', () => {
    const data: PatternData = {
      ...initialFaqDisclosureData,
      items: { ...initialFaqDisclosureData.items, unknown: { label: 'Unknown row' } },
      relations: { ...initialFaqDisclosureData.relations, rootKeys: [...(initialFaqDisclosureData.relations?.rootKeys ?? []), 'unknown'] },
    }

    render(<DisclosureDemo variant="faq" initial={data} />)
    const [first] = screen.getAllByRole('button')

    fireEvent.keyDown(first!, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(first!.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Unknown row')).toBeNull()
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

  it('ArrowDown opens a closed submenu and moves focus to its first link', async () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about] = screen.getAllByRole('button')

    fireEvent.keyDown(about!, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(about!.getAttribute('aria-expanded')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Overview' })))
  })

  it('ArrowUp on an open trigger focuses the last submenu link', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about] = screen.getAllByRole('button')

    fireEvent.click(about!)
    fireEvent.keyDown(about!, { key: 'ArrowUp', code: 'ArrowUp' })

    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Mission' }))
  })

  it('Spacebar toggles a trigger and Escape on a collapsed trigger keeps focus there', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about] = screen.getAllByRole('button')

    fireEvent.keyDown(about!, { key: 'Spacebar', code: 'Space' })
    expect(about!.getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(about!, { key: 'Spacebar', code: 'Space' })
    expect(about!.getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(about!, { key: 'Escape', code: 'Escape' })
    expect(document.activeElement).toBe(about)
  })

  it('ArrowRight closes an open trigger before moving to the next top-level item', () => {
    render(<DisclosureDemo variant="navMenu" initial={initialNavMenuDisclosureData} />)
    const [about, admissions] = screen.getAllByRole('button')

    fireEvent.click(about!)
    fireEvent.keyDown(about!, { key: 'ArrowRight', code: 'ArrowRight' })

    expect(about!.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(admissions)
  })

  it('covers nav menu keyboard guard branches through pointer-triggered keys', () => {
    render(<NavMenuKeyboardEdgesDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Wrap link previous' }))
    expect(document.activeElement).toBe(screen.getByText('Two'))

    fireEvent.click(screen.getByRole('button', { name: 'Ignore link key' }))
    expect(document.activeElement).toBe(screen.getByText('Two'))

    fireEvent.click(screen.getByRole('button', { name: 'Wrap link next' }))
    expect(document.activeElement).toBe(screen.getByText('One'))

    fireEvent.click(screen.getByRole('button', { name: 'Missing link index' }))
    expect(document.activeElement).toBe(screen.getByText('One'))

    fireEvent.click(screen.getByRole('button', { name: 'Focus last link' }))
    expect(document.activeElement).toBe(screen.getByText('Two'))

    fireEvent.click(screen.getByRole('button', { name: 'Focus missing last link' }))
    expect(document.activeElement).toBe(screen.getByText('Two'))

    fireEvent.click(screen.getByRole('button', { name: 'Arrow up collapsed' }))
    expect(document.activeElement).toBe(screen.getByText('Two'))

    fireEvent.click(screen.getByRole('button', { name: 'Escape expanded' }))
    expect(document.activeElement).toBe(screen.getByText('About'))

    fireEvent.click(screen.getByRole('button', { name: 'Escape collapsed' }))
    expect(document.activeElement).toBe(screen.getByText('Admissions'))

    fireEvent.click(screen.getByRole('button', { name: 'Move previous' }))
    expect(document.activeElement).toBe(screen.getByText('About'))

    fireEvent.click(screen.getByRole('button', { name: 'Ignore button key' }))
    expect(document.activeElement).toBe(screen.getByText('About'))

    fireEvent.click(screen.getByRole('button', { name: 'Move next expanded' }))
    expect(document.activeElement).toBe(screen.getByText('Admissions'))

    fireEvent.click(screen.getByRole('button', { name: 'Move missing index' }))
    expect(document.activeElement).toBe(screen.getByText('Admissions'))
    expect(screen.getByTestId('nav-events').textContent).toContain('expand:about:false')
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
