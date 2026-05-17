import { useState } from 'react'
import { carouselSlides, type CarouselSlide } from './carouselData'

export interface CarouselProps {
  slides?: readonly CarouselSlide[]
  showDots?: boolean
  label?: string
}

export function Carousel({ slides = carouselSlides, showDots = true, label = 'Featured photos' }: CarouselProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length
  const go = (next: number) => setIndex(((next % count) + count) % count)

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="grid max-w-xl gap-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous Slide"
          onClick={() => go(index - 1)}
          className="h-8 rounded bg-zinc-100 px-3 text-sm hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Prev
        </button>
        <div className="flex-1 text-center text-xs uppercase tracking-wide text-zinc-500">
          {`Slide ${index + 1} of ${count}`}
        </div>
        <button
          type="button"
          aria-label="Next Slide"
          onClick={() => go(index + 1)}
          className="h-8 rounded bg-zinc-100 px-3 text-sm hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Next
        </button>
      </div>
      <div className="relative grid">
        {slides.map((slide, i) => {
          const active = i === index
          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.title}`}
              aria-hidden={active ? undefined : true}
              data-testid={`slide-${slide.key}`}
              className={active ? 'block rounded bg-zinc-50 p-4 dark:bg-zinc-900/70' : 'hidden'}
            >
              <div className="font-semibold">{slide.title}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{slide.caption}</div>
            </div>
          )
        })}
      </div>
      {showDots ? (
        <div role="group" aria-label="Choose slide" className="flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Slide ${i + 1}`}
              aria-pressed={i === index}
              data-testid={`dot-${slide.key}`}
              onClick={() => go(i)}
              className={`size-3 rounded-full ${i === index ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
