import { useReducer, type HTMLAttributes } from 'react'
import { createPatternRuntime, reducePatternData, type PatternData } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { initialCarouselData } from './carouselData'

export interface CarouselProps {
  data?: PatternData
}

export function Carousel({ data: initialData = initialCarouselData }: CarouselProps) {
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
  const showDots = ((data.state as { showDots?: boolean } | undefined)?.showDots ?? true) === true

  return (
    <div
      {...rootProps}
      className="grid max-w-xl gap-3"
    >
      <div className="flex items-center gap-2">
        <button
          {...prevProps}
          type="button"
          className="h-8 rounded-xl bg-zinc-100/80 px-3 text-sm font-medium shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
        >
          Prev
        </button>
        <div className="flex-1 text-center text-xs uppercase tracking-wide text-zinc-500">
          {`Slide ${slides.findIndex((slide) => slide.key === activeKey) + 1} of ${count}`}
        </div>
        <button
          {...nextProps}
          type="button"
          className="h-8 rounded-xl bg-zinc-100/80 px-3 text-sm font-medium shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
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
              className={active ? 'block rounded-xl bg-zinc-100/70 p-4 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10' : 'hidden'}
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
              className={`size-3 rounded-full shadow-sm transition ${slide.key === activeKey ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300/80 hover:bg-zinc-400 dark:bg-white/[0.14] dark:hover:bg-white/[0.22]'}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
