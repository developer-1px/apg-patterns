import { useReducer } from 'react'
import { reducePatternData, useCarouselPattern, type PatternData, type PatternEvent } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { initialCarouselData } from './carouselData'

export interface CarouselProps {
  data?: PatternData
  onEvent?: (event: PatternEvent) => void
}

export function Carousel({ data = initialCarouselData, onEvent }: CarouselProps) {
  const [localData, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(carouselDefinition, current, event),
    data,
  )
  const isControlled = onEvent !== undefined
  const carousel = useCarouselPattern(isControlled ? data : localData, isControlled ? onEvent : dispatch)
  const count = carousel.slides.length

  return (
    <div {...carousel.rootProps} className="grid max-w-xl gap-3">
      <div className="flex items-center gap-2">
        <button
          {...carousel.prevProps}
          type="button"
          className="h-8 rounded-xl bg-zinc-100/80 px-3 text-sm font-medium shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
        >
          Prev
        </button>
        <div className="flex-1 text-center text-xs uppercase tracking-wide text-zinc-500">
          {`Slide ${carousel.slides.findIndex((slide) => slide.key === carousel.activeKey) + 1} of ${count}`}
        </div>
        <button
          {...carousel.nextProps}
          type="button"
          className="h-8 rounded-xl bg-zinc-100/80 px-3 text-sm font-medium shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
        >
          Next
        </button>
      </div>
      <div className="relative grid">
        {carousel.slides.map((slide) => (
          <div
            {...slide.slideProps}
            key={slide.key}
            aria-label={`${slide.index + 1} of ${count}: ${slide.title}`}
            data-testid={`slide-${slide.key}`}
            className={slide.active ? 'block rounded-xl bg-zinc-100/70 p-4 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10' : 'hidden'}
          >
            <div className="font-semibold">{slide.title}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">{slide.caption}</div>
          </div>
        ))}
      </div>
      {carousel.showDots ? (
        <div role="group" aria-label="Choose slide" className="flex justify-center gap-2">
          {carousel.slides.map((slide) => (
            <button
              {...slide.pickerProps}
              key={slide.key}
              type="button"
              data-testid={`dot-${slide.key}`}
              className={`size-3 rounded-full shadow-sm transition ${slide.active ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300/80 hover:bg-zinc-400 dark:bg-white/[0.14] dark:hover:bg-white/[0.22]'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
