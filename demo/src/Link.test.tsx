import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PatternEvent } from '../../src'
import { Link } from './Link'
import { initialAnchorLinkData, initialSpanLinkData } from './linkData'

const linkHref = (data: typeof initialAnchorLinkData | typeof initialSpanLinkData) => {
  const key = data.relations?.rootKeys?.[0]!
  return String((data.items[key] as { href?: unknown }).href)
}

describe('Link demo (anchor)', () => {
  it('renders <a> with role=link and href', () => {
    render(
      <Link data={initialAnchorLinkData} variant="anchor" />,
    )
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe(linkHref(initialAnchorLinkData))
  })

  it('click emits activate with href', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    const onActivate = vi.fn<(key: string, href: string) => void>()
    render(
      <Link
        data={initialAnchorLinkData}
        variant="anchor"
        onEvent={onEvent}
        onActivate={onActivate}
      />,
    )
    const link = screen.getByRole('link')
    fireEvent.click(link)
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'home' })
    expect(onActivate).toHaveBeenCalledWith('home', linkHref(initialAnchorLinkData))
  })

  it('Enter key emits activate', () => {
    const onActivate = vi.fn<(key: string, href: string) => void>()
    render(
      <Link
        data={initialAnchorLinkData}
        variant="anchor"
        onActivate={onActivate}
      />,
    )
    const link = screen.getByRole('link')
    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' })
    expect(onActivate).toHaveBeenCalledWith('home', linkHref(initialAnchorLinkData))
  })
})

describe('Link demo (spanRole)', () => {
  it('renders <span role="link"> with data-href', () => {
    render(
      <Link data={initialSpanLinkData} variant="spanRole" />,
    )
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('SPAN')
    expect(link.getAttribute('role')).toBe('link')
    expect(link.getAttribute('data-href')).toBe(linkHref(initialSpanLinkData))
  })

  it('click and Enter both emit activate with href', () => {
    const onActivate = vi.fn<(key: string, href: string) => void>()
    render(
      <Link
        data={initialSpanLinkData}
        variant="spanRole"
        onActivate={onActivate}
      />,
    )
    const link = screen.getByRole('link')
    fireEvent.click(link)
    expect(onActivate).toHaveBeenLastCalledWith('home', linkHref(initialSpanLinkData))

    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' })
    expect(onActivate).toHaveBeenCalledTimes(2)
    expect(onActivate).toHaveBeenLastCalledWith('home', linkHref(initialSpanLinkData))
  })
})
