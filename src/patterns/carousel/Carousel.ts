import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternState } from '../../schema'
import type { ReactCarouselSlide } from './carouselSlide'
import { useCarouselPattern } from './useCarouselPattern'

type CarouselDataItem = PatternItem & {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface CarouselProps<TItem extends CarouselDataItem = CarouselDataItem> {
  data: PatternData<TItem, PatternState & { showDots?: boolean }>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSlide?: (slide: ReactCarouselSlide, dataItem: TItem) => ReactNode
}

export function Carousel<TItem extends CarouselDataItem = CarouselDataItem>({ data, onEvent, options, className, renderSlide }: CarouselProps<TItem>) {
  const carousel = useCarouselPattern(data, onEvent, options)

  return createElement('div', { ...carousel.rootProps, className } as DivProps, [
    createElement('button', { key: 'prev', ...carousel.prevProps } as ComponentPropsWithoutRef<'button'>, data.items.prev?.label ?? 'Previous'),
    createElement('button', { key: 'next', ...carousel.nextProps } as ComponentPropsWithoutRef<'button'>, data.items.next?.label ?? 'Next'),
    ...carousel.slides.map((slide) => {
      const dataItem = data.items[slide.key]
      return createElement('div', { key: slide.key, ...slide.slideProps } as DivProps & { key: Key }, renderSlide?.(slide, dataItem) ?? [
        slide.imageUrl ? createElement('img', { key: 'image', src: slide.imageUrl, alt: slide.imageAlt } as ComponentPropsWithoutRef<'img'>) : null,
        createElement('strong', { key: 'title' }, slide.title),
        slide.caption ? createElement('span', { key: 'caption' }, slide.caption) : null,
      ])
    }),
    carousel.showDots
      ? createElement(
          'div',
          { key: 'pickers' } as DivProps,
          carousel.slides.map((slide) =>
            createElement('button', { key: slide.key, ...slide.pickerProps } as ComponentPropsWithoutRef<'button'> & { key: Key }, data.items[slide.key]?.label ?? slide.title),
          ),
        )
      : null,
  ])
}
