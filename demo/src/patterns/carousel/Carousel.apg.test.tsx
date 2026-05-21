/**
 * APG Carousel 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CarouselDemo } from './testing/CarouselTestHost'

describe('APG §Roles, States, Properties', () => {
  it('container has role="region" or "group"', () => {
    render(<CarouselDemo />)
    const r = screen.queryByRole('region') || screen.queryByRole('group')
    expect(r).toBeTruthy()
  })

  it('container has aria-roledescription="carousel"', () => {
    render(<CarouselDemo />)
    const r = screen.queryByRole('region') || screen.queryByRole('group')
    expect(r!.getAttribute('aria-roledescription')).toBe('carousel')
  })

  it('container has accessible name', () => {
    render(<CarouselDemo />)
    const r = (screen.queryByRole('region') || screen.queryByRole('group'))!
    const name = r.getAttribute('aria-label') || r.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('slides have aria-roledescription="slide" (if individually addressable)', () => {
    render(<CarouselDemo />)
    const slides = document.querySelectorAll('[aria-roledescription="slide"]')
    expect(slides.length).toBeGreaterThan(0)
  })
})
