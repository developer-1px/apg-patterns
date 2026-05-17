import { useReducer } from 'react'
import { reducePatternData, useCarouselPattern, type PatternData, type PatternEvent } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { initialCarouselData } from './carouselData'
import { Icon } from '../../shared/Icon'

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
          className="grid size-8 place-items-center rounded-xl bg-zinc-100/80 text-zinc-700 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
        >
          <Icon name="arrow-left" className="text-sm" />
          <span className="sr-only">Previous slide</span>
        </button>
        <div className="flex-1 text-center text-xs font-medium text-zinc-500 dark:text-zinc-500">
          {`${carousel.slides.findIndex((slide) => slide.key === carousel.activeKey) + 1} / ${count}`}
        </div>
        <button
          {...carousel.nextProps}
          type="button"
          className="grid size-8 place-items-center rounded-xl bg-zinc-100/80 text-zinc-700 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
        >
          <Icon name="arrow-right" className="text-sm" />
          <span className="sr-only">Next slide</span>
        </button>
      </div>
      <div className="relative grid">
        {carousel.slides.map((slide) => (
          <div
            {...slide.slideProps}
            key={slide.key}
            aria-label={`${slide.index + 1} of ${count}: ${slide.title}`}
            data-testid={`slide-${slide.key}`}
            className={slide.active ? 'relative block min-h-56 overflow-hidden rounded-xl bg-zinc-100/70 shadow-[0_16px_42px_rgba(24,24,27,0.12)] dark:bg-white/[0.045] dark:shadow-black/25' : 'hidden'}
          >
            {slide.imageUrl ? <img src={slide.imageUrl} alt="" className="h-56 w-full object-cover" /> : null}
            <div className="absolute inset-x-0 bottom-0 bg-black/62 p-4 text-white backdrop-blur-sm">
              <div className="text-sm font-semibold">{slide.title}</div>
              <div className="mt-0.5 text-sm text-white/78">{slide.caption}</div>
            </div>
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
