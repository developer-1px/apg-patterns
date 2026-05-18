import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { Link } from './Link'
import { initialAnchorLinkData, initialSpanLinkData } from './linkData'

const linkHref = (data: typeof initialAnchorLinkData | typeof initialSpanLinkData) => {
  const key = data.relations?.rootKeys?.[0]!
  return String((data.items[key] as { href?: unknown }).href)
}

describe('Link demo (anchor)', () => {
  it('renders <a> with role=link and href', () => {
    render(
      <Link data={initialAnchorLinkData} />,
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
})

describe('Link demo (spanRole)', () => {
  it('renders <span role="link"> with data-href', () => {
    render(
      <Link data={initialSpanLinkData} />,
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
