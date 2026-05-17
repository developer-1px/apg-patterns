import { useReducer, type HTMLAttributes } from 'react'
import { createPatternRuntime, reducePatternData, type PatternData } from '../../src'
import { carouselDefinition } from '../../src/patterns/carousel/definition'
import { initialCarouselData } from './carouselData'

export interface CarouselProps {
  data?: PatternData
  showDots?: boolean
}

export function Carousel({ data: initialData = initialCarouselData, showDots = true }: CarouselProps) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: Parameters<typeof reducePatternData>[2]) =>
      reducePatternData(carouselDefinition, current, event),
    initialData,
  )
  const runtime = createPatternRuntime({
    definition: carouselDefinition,
    data,
    options: { roledescription: 'carousel', slideRoledescription: 'slide' },
    onEvent: dispatch,
  })
  const slideKeys = data.relations?.rootKeys ?? []
  const activeKey = data.state?.activeKey ?? slideKeys[0]
  const slides = slideKeys.map((key) => ({
    key,
    title: String((data.items[key] as { title?: unknown } | undefined)?.title ?? data.items[key]?.label ?? key),
    caption: String((data.items[key] as { caption?: unknown } | undefined)?.caption ?? ''),
  }))
  const count = slides.length
  const rootProps = runtime.getPartProps('root') as HTMLAttributes<HTMLElement>
  const prevProps = runtime.getPartProps('prev', 'prev') as HTMLAttributes<HTMLButtonElement>
  const nextProps = runtime.getPartProps('next', 'next') as HTMLAttributes<HTMLButtonElement>

  return (
    <div
      {...rootProps}
      className="grid max-w-xl gap-3"
    >
      <div className="flex items-center gap-2">
        <button
          {...prevProps}
          type="button"
          className="h-8 rounded bg-zinc-100 px-3 text-sm hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Prev
        </button>
        <div className="flex-1 text-center text-xs uppercase tracking-wide text-zinc-500">
          {`Slide ${slides.findIndex((slide) => slide.key === activeKey) + 1} of ${count}`}
        </div>
        <button
          {...nextProps}
          type="button"
          className="h-8 rounded bg-zinc-100 px-3 text-sm hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          Next
        </button>
      </div>
      <div className="relative grid">
        {slides.map((slide, i) => {
          const active = slide.key === activeKey
          const slideProps = runtime.getPartProps('slide', slide.key) as HTMLAttributes<HTMLElement>
          return (
            <div
              {...slideProps}
              key={slide.key}
              aria-label={`${i + 1} of ${count}: ${slide.title}`}
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
              {...(runtime.getPartProps('picker', slide.key) as HTMLAttributes<HTMLButtonElement>)}
              key={slide.key}
              type="button"
              data-testid={`dot-${slide.key}`}
              className={`size-3 rounded-full ${slide.key === activeKey ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
