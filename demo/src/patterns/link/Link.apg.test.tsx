/**
 * APG Link 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/link/
 *
 *   1) Keyboard: Enter activates the link
 *   2) Roles, States, Properties: role=link
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PatternEvent } from '../../../../src/react'
import { Link } from './Link'
import { linkVariants } from './linkData'

const ignoreEvent = () => undefined
const initialAnchorLinkData = linkVariants.anchor.data
const initialSpanLinkData = linkVariants.spanRole.data

describe('APG §Roles, States, Properties', () => {
  it('anchor variant has role="link"', () => {
    render(<Link data={initialAnchorLinkData} onEvent={ignoreEvent} />)
    expect(screen.getByRole('link')).toBeTruthy()
  })

  it('span variant exposes role="link"', () => {
    render(<Link data={initialSpanLinkData} onEvent={ignoreEvent} />)
    expect(screen.getByRole('link')).toBeTruthy()
  })

  it('has accessible name (text content)', () => {
    render(<Link data={initialAnchorLinkData} onEvent={ignoreEvent} />)
    expect(screen.getByRole('link').textContent?.trim()).toBeTruthy()
  })
})

describe('APG §Keyboard — Enter activates', () => {
  it('Enter fires activate event', () => {
    const onEvent = vi.fn<(event: PatternEvent) => void>()
    render(<Link data={initialAnchorLinkData} onEvent={onEvent} />)
    fireEvent.keyDown(screen.getByRole('link'), { key: 'Enter', code: 'Enter' })
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'activate' }))
  })
})

describe('APG §Implementation note — native anchor preferred', () => {
  it('anchor variant uses <a> with href', () => {
    render(<Link data={initialAnchorLinkData} onEvent={ignoreEvent} />)
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBeTruthy()
  })
})
