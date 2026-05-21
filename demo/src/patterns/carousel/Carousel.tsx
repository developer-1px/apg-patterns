import { useCarouselPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'

interface CarouselProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Carousel({ data, onEvent }: CarouselProps) {
  const carousel = useCarouselPattern(data, onEvent)
  const count = carousel.slides.length

  return (
    <div {...carousel.rootProps} className="grid max-w-xl gap-3">
      <div className="flex items-center gap-2">
        <button
          {...carousel.prevProps}
          type="button"
          className={cx(ds.iconButton, 'size-8 text-zinc-700')}
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
          className={cx(ds.iconButton, 'size-8 text-zinc-700')}
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
            className={slide.active ? 'relative block min-h-56 overflow-hidden rounded-md border border-zinc-200 dark:border-white/10' : 'hidden'}
          >
            {slide.imageUrl ? <img src={slide.imageUrl} alt={slide.imageAlt} className="h-56 w-full object-cover" /> : null}
            <div className="absolute inset-x-0 bottom-0 bg-black/62 p-4 text-white">
              <div className="text-sm font-semibold">{slide.title}</div>
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
              className={`size-3 rounded-full transition ${slide.active ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300/80 hover:bg-zinc-400 dark:bg-white/[0.14] dark:hover:bg-white/[0.22]'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
