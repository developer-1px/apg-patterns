import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Breadcrumb } from './Breadcrumb'
import { breadcrumbItems } from './breadcrumbData'

describe('Breadcrumb demo', () => {
  it('renders a navigation landmark labelled "Breadcrumb"', () => {
    render(<Breadcrumb />)
    const nav = screen.getByRole('navigation')
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb')
    expect(nav.tagName).toBe('NAV')
  })

  it('renders one link per item inside an ordered list', () => {
    render(<Breadcrumb />)
    const nav = screen.getByRole('navigation')
    const list = within(nav).getByRole('list')
    expect(list.tagName).toBe('OL')
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(breadcrumbItems.length)
  })

  it('marks only the final crumb with aria-current="page"', () => {
    render(<Breadcrumb />)
    const links = screen.getAllByRole('link')
    const last = links[links.length - 1]!
    expect(last.getAttribute('aria-current')).toBe('page')
    for (const link of links.slice(0, -1)) {
      expect(link.hasAttribute('aria-current')).toBe(false)
    }
  })

  it('fires onNavigate with the clicked item', () => {
    const onNavigate = vi.fn()
    render(<Breadcrumb onNavigate={onNavigate} />)
    const links = screen.getAllByRole('link')
    fireEvent.click(links[1]!)
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith(breadcrumbItems[1])
  })
})
