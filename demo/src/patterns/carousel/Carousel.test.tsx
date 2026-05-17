import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Carousel } from './Carousel'
import { carouselSlides } from './carouselData'

function activeSlideKey(): string | null {
  for (const slide of carouselSlides) {
    const el = screen.getByTestId(`slide-${slide.key}`)
    if (el.getAttribute('aria-hidden') !== 'true') return slide.key
  }
  return null
}

describe('Carousel demo', () => {
  it('renders root with region role and aria-roledescription="carousel"', () => {
    render(<Carousel />)
    const region = screen.getByRole('region', { name: /featured photos/i })
    expect(region.getAttribute('aria-roledescription')).toBe('carousel')
  })

  it('initially shows the first slide and hides the others', () => {
    render(<Carousel />)
    expect(activeSlideKey()).toBe(carouselSlides[0].key)
    expect(screen.getByTestId(`slide-${carouselSlides[1].key}`).getAttribute('aria-hidden')).toBe('true')
  })

  it('Next button advances aria-hidden to next slide', () => {
    render(<Carousel />)
    fireEvent.click(screen.getByRole('button', { name: /next slide/i }))
    expect(activeSlideKey()).toBe(carouselSlides[1].key)
    expect(screen.getByTestId(`slide-${carouselSlides[0].key}`).getAttribute('aria-hidden')).toBe('true')
  })

  it('Prev button wraps to the last slide from the first', () => {
    render(<Carousel />)
    fireEvent.click(screen.getByRole('button', { name: /previous slide/i }))
    const last = carouselSlides[carouselSlides.length - 1].key
    expect(activeSlideKey()).toBe(last)
  })

  it('Next wraps from the last slide back to the first', () => {
    render(<Carousel />)
    const next = screen.getByRole('button', { name: /next slide/i })
    for (let i = 0; i < carouselSlides.length; i += 1) fireEvent.click(next)
    expect(activeSlideKey()).toBe(carouselSlides[0].key)
  })

  it('dot indicator click jumps directly to that slide', () => {
    render(<Carousel />)
    const target = carouselSlides[2]
    fireEvent.click(screen.getByTestId(`dot-${target.key}`))
    expect(activeSlideKey()).toBe(target.key)
    expect(screen.getByTestId(`dot-${target.key}`).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId(`dot-${carouselSlides[0].key}`).getAttribute('aria-pressed')).toBe('false')
  })

  it('each slide has role="group" and aria-roledescription="slide"', () => {
    render(<Carousel />)
    for (const slide of carouselSlides) {
      const el = screen.getByTestId(`slide-${slide.key}`)
      expect(el.getAttribute('role')).toBe('group')
      expect(el.getAttribute('aria-roledescription')).toBe('slide')
    }
  })
})
