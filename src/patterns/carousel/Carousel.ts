import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions, PatternState } from '../../schema'
import { useCarouselPattern, type ReactCarouselSlide } from './useCarouselPattern'

type CarouselDataItem = PatternItem & {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
}

export interface CarouselProps<TItem extends CarouselDataItem = CarouselDataItem> {
  data: PatternData<TItem, PatternState & { showDots?: boolean }>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSlide?: (slide: ReactCarouselSlide, dataItem: TItem) => ReactNode
}

export function Carousel<TItem extends CarouselDataItem = CarouselDataItem>({ data, onEvent, options, className, renderSlide }: CarouselProps<TItem>) {
  const carousel = useCarouselPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...carousel.rootProps, className },
    createElement('button', carousel.prevProps, data.items.prev?.label ?? 'Previous'),
    createElement('button', carousel.nextProps, data.items.next?.label ?? 'Next'),
    ...carousel.slides.map((slide) => {
      const dataItem = data.items[slide.key]
      const slideContent = renderSlide?.(slide, dataItem)

      return slideContent !== undefined && slideContent !== null
        ? createElement('div', { key: slide.key, ...slide.slideProps }, slideContent)
        : createElement(
            'div',
            { key: slide.key, ...slide.slideProps },
            slide.imageUrl ? createElement('img', { src: slide.imageUrl, alt: slide.imageAlt }) : null,
            createElement('strong', null, slide.title),
            slide.caption ? createElement('span', null, slide.caption) : null,
          )
    }),
    carousel.showDots
      ? createElement(
          'div',
          null,
          carousel.slides.map((slide) =>
            createElement('button', { key: slide.key, ...slide.pickerProps }, data.items[slide.key]?.label ?? slide.title),
          ),
        )
      : null,
  )
}
