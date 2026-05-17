import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Feed } from './Feed'

const activeArticle = () => document.querySelector('[role="article"][data-active]') as HTMLElement | null

describe('Feed demo', () => {
  it('renders role=feed with aria-label and 10+ articles', () => {
    render(<Feed />)
    const feed = screen.getByRole('feed')
    expect(feed.getAttribute('aria-label')).toBe('Demo feed')
    const articles = screen.getAllByRole('article')
    expect(articles.length).toBeGreaterThanOrEqual(10)
  })

  it('articles advertise aria-posinset / aria-setsize / aria-labelledby', () => {
    render(<Feed />)
    const articles = screen.getAllByRole('article')
    const total = articles.length
    expect(articles[0]!.getAttribute('aria-posinset')).toBe('1')
    expect(articles[0]!.getAttribute('aria-setsize')).toBe(String(total))
    expect(articles[total - 1]!.getAttribute('aria-posinset')).toBe(String(total))
    const labelledBy = articles[0]!.getAttribute('aria-labelledby')!
    expect(labelledBy).toBeTruthy()
    const heading = document.getElementById(labelledBy)
    expect(heading?.textContent).toBe('Welcome to APG Feed')
  })

  it('PageDown moves active article to the next one', () => {
    render(<Feed />)
    const feed = screen.getByRole('feed')
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe('Welcome to APG Feed')
    fireEvent.keyDown(feed, { key: 'PageDown', code: 'PageDown' })
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe('Lazy Loading')
  })

  it('PageUp moves active article to the previous one', () => {
    render(<Feed />)
    const feed = screen.getByRole('feed')
    fireEvent.keyDown(feed, { key: 'PageDown', code: 'PageDown' })
    fireEvent.keyDown(feed, { key: 'PageDown', code: 'PageDown' })
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe('Focus Management')
    fireEvent.keyDown(feed, { key: 'PageUp', code: 'PageUp' })
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe('Lazy Loading')
  })

  it('Ctrl+Home jumps to first, Ctrl+End jumps to last article', () => {
    render(<Feed />)
    const feed = screen.getByRole('feed')
    fireEvent.keyDown(feed, { key: 'End', code: 'End', ctrlKey: true })
    const articles = screen.getAllByRole('article')
    const lastTitle = articles[articles.length - 1]!.querySelector('h3')?.textContent
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe(lastTitle)

    fireEvent.keyDown(feed, { key: 'Home', code: 'Home', ctrlKey: true })
    expect(activeArticle()?.querySelector('h3')?.textContent).toBe('Welcome to APG Feed')
  })
})
