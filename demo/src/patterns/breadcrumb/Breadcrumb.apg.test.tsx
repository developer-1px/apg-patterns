/**
 * APG Breadcrumb 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 */
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from './Breadcrumb'
import { initialBreadcrumbData } from './breadcrumbData'

describe('APG §Roles, States, Properties', () => {
  it('breadcrumb trail is inside a navigation landmark', () => {
    render(<Breadcrumb data={initialBreadcrumbData} onEvent={() => {}} />)
    expect(screen.getByRole('navigation')).toBeTruthy()
  })

  it('navigation region has aria-label or aria-labelledby', () => {
    render(<Breadcrumb data={initialBreadcrumbData} onEvent={() => {}} />)
    const nav = screen.getByRole('navigation')
    const name = nav.getAttribute('aria-label') || nav.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('current page link has aria-current="page"', () => {
    render(<Breadcrumb data={initialBreadcrumbData} onEvent={() => {}} />)
    const links = within(screen.getByRole('navigation')).getAllByRole('link')
    const currents = links.filter((l) => l.getAttribute('aria-current') === 'page')
    expect(currents.length).toBeGreaterThanOrEqual(1)
  })

  it('non-current links do not expose aria-current', () => {
    render(<Breadcrumb data={initialBreadcrumbData} onEvent={() => {}} />)
    const links = within(screen.getByRole('navigation')).getAllByRole('link')
    const currents = links.filter((l) => l.getAttribute('aria-current') === 'page')
    const nonCurrent = links.filter((l) => !currents.includes(l))
    nonCurrent.forEach((l) => {
      expect(l.hasAttribute('aria-current')).toBe(false)
    })
  })
})
