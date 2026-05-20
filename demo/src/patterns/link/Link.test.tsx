import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useLinkPattern, type PatternData, type PatternEvent } from '../../../../src'
import { Link } from './Link'
import { initialAnchorLinkData, initialSpanLinkData } from './linkData'

const linkHref = (data: typeof initialAnchorLinkData | typeof initialSpanLinkData) => {
  const key = data.relations?.rootKeys?.[0]!
  return String((data.items[key] as { href?: unknown }).href)
}
const ignoreEvent = () => undefined

function LinkActionsDemo({ empty = false }: { empty?: boolean }) {
  const [events, setEvents] = useState(0)
  const data: PatternData = empty ? { items: {}, relations: { rootKeys: [] }, state: {} } : initialAnchorLinkData
  const link = useLinkPattern(data, (event) => {
    if (event.type === 'activate') setEvents((current) => current + 1)
  })

  return (
    <div>
      <button type="button" onClick={() => link.actions.activate()}>Activate action</button>
      <output data-testid="link-key">{String(link.key ?? '')}</output>
      <output data-testid="link-label">{link.label}</output>
      <output data-testid="link-href">{link.href}</output>
      <output data-testid="link-variant">{link.variant}</output>
      <output data-testid="link-active">{String(link.state.active)}</output>
      <output data-testid="link-events">{String(events)}</output>
      <output data-testid="link-id">{empty ? '' : link.ids.forKey('home')}</output>
    </div>
  )
}

describe('Link demo (anchor)', () => {
  it('renders <a> with role=link and href', () => {
    render(
      <Link data={initialAnchorLinkData} onEvent={ignoreEvent} />,
    )
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe(linkHref(initialAnchorLinkData))
  })

  it('click emits activate with href', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    render(
      <Link
        data={initialAnchorLinkData}
        onEvent={onEvent}
      />,
    )
    const link = screen.getByRole('link')
    expect(fireEvent.click(link)).toBe(false)
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'home' })
  })

  it('Enter key emits activate', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    render(
      <Link
        data={initialAnchorLinkData}
        onEvent={onEvent}
      />,
    )
    const link = screen.getByRole('link')
    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' })
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'home' })
  })

  it('exposes disabled state from pattern data while preserving mouse activation wiring', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    render(
      <Link
        data={{
          ...initialAnchorLinkData,
          state: {
            ...initialAnchorLinkData.state,
            disabledKeys: ['home'],
          },
        }}
        onEvent={onEvent}
      />,
    )

    const link = screen.getByRole('link')
    expect(link.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(link)
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'home' })
  })

  it('imperative action emits activate from pointer control', () => {
    render(<LinkActionsDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Activate action' }))

    expect(screen.getByTestId('link-key').textContent).toBe('home')
    expect(screen.getByTestId('link-label').textContent).toBe('WAI-ARIA Authoring Practices')
    expect(screen.getByTestId('link-href').textContent).toBe('https://www.w3.org/WAI/ARIA/apg/')
    expect(screen.getByTestId('link-variant').textContent).toBe('anchor')
    expect(screen.getByTestId('link-active').textContent).toBe('true')
    expect(screen.getByTestId('link-events').textContent).toBe('1')
    expect(screen.getByTestId('link-id').textContent).toContain('link-home')
  })

  it('imperative action is harmless without a root key', () => {
    render(<LinkActionsDemo empty />)

    fireEvent.click(screen.getByRole('button', { name: 'Activate action' }))

    expect(screen.getByTestId('link-key').textContent).toBe('')
    expect(screen.getByTestId('link-label').textContent).toBe('')
    expect(screen.getByTestId('link-href').textContent).toBe('#')
    expect(screen.getByTestId('link-variant').textContent).toBe('anchor')
    expect(screen.getByTestId('link-events').textContent).toBe('0')
  })
})

describe('Link demo (spanRole)', () => {
  it('renders <span role="link"> with data-href', () => {
    render(
      <Link data={initialSpanLinkData} onEvent={ignoreEvent} />,
    )
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('SPAN')
    expect(link.getAttribute('role')).toBe('link')
    expect(link.getAttribute('data-href')).toBe(linkHref(initialSpanLinkData))
  })

  it('click and Enter both emit activate with href', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    render(
      <Link
        data={initialSpanLinkData}
        onEvent={onEvent}
      />,
    )
    const link = screen.getByRole('link')
    fireEvent.click(link)
    expect(onEvent).toHaveBeenLastCalledWith({ type: 'activate', key: 'home' })

    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' })
    expect(onEvent).toHaveBeenCalledTimes(2)
    expect(onEvent).toHaveBeenLastCalledWith({ type: 'activate', key: 'home' })
  })
})
