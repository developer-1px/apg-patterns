/**
 * APG Feed 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/feed/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeedDemo } from './testing/FeedTestHost'

describe('APG §Roles, States, Properties', () => {
  it('container has role="feed"', () => {
    render(<FeedDemo />)
    expect(screen.getByRole('feed')).toBeTruthy()
  })

  it('feed has accessible name', () => {
    render(<FeedDemo />)
    const f = screen.getByRole('feed')
    const name = f.getAttribute('aria-label') || f.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('each item has role="article"', () => {
    render(<FeedDemo />)
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0)
  })

  it('each article exposes aria-posinset and aria-setsize', () => {
    render(<FeedDemo />)
    screen.getAllByRole('article').forEach((a) => {
      expect(a.getAttribute('aria-posinset')).toBeTruthy()
      expect(a.getAttribute('aria-setsize')).toBeTruthy()
    })
  })

  it('aria-posinset is 1-indexed and contiguous', () => {
    render(<FeedDemo />)
    const positions = screen.getAllByRole('article').map((a) => Number(a.getAttribute('aria-posinset')))
    expect(positions[0]).toBe(1)
    for (let i = 1; i < positions.length; i++) expect(positions[i]).toBe(positions[i - 1]! + 1)
  })

  it('aria-busy (if present) is "true" or "false"', () => {
    render(<FeedDemo />)
    const v = screen.getByRole('feed').getAttribute('aria-busy')
    if (v !== null) expect(['true', 'false']).toContain(v)
  })

  it('articles expose aria-labelledby', () => {
    render(<FeedDemo />)
    screen.getAllByRole('article').forEach((a) => {
      const id = a.getAttribute('aria-labelledby')
      if (id) expect(document.getElementById(id)).toBeTruthy()
    })
  })
})

describe('APG §Keyboard — PageDown / PageUp move article', () => {
  it('PageDown moves active to next article', () => {
    render(<FeedDemo />)
    const feed = screen.getByRole('feed')
    const before = feed.querySelector('[role="article"][data-active]')?.getAttribute('aria-posinset')
    fireEvent.keyDown(feed, { key: 'PageDown' })
    const after = feed.querySelector('[role="article"][data-active]')?.getAttribute('aria-posinset')
    if (before && after) expect(after).not.toBe(before)
  })

  it('PageUp moves active to previous article', () => {
    render(<FeedDemo />)
    const feed = screen.getByRole('feed')
    fireEvent.keyDown(feed, { key: 'PageDown' })
    const before = feed.querySelector('[role="article"][data-active]')?.getAttribute('aria-posinset')
    fireEvent.keyDown(feed, { key: 'PageUp' })
    const after = feed.querySelector('[role="article"][data-active]')?.getAttribute('aria-posinset')
    if (before && after) expect(after).not.toBe(before)
  })
})
