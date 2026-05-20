import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'
import type { ReactCarouselSlide } from './carouselSlide'
import { useCarouselPattern } from './useCarouselPattern'

type CarouselDataItem = PatternItem & {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
}

type CarouselDataState = PatternStateWithOptions & {
  showDots?: boolean
}

type DivProps = ComponentPropsWithoutRef<'div'>
type ButtonProps = ComponentPropsWithoutRef<'button'>
type ImgProps = ComponentPropsWithoutRef<'img'>

export interface CarouselProps<TItem extends CarouselDataItem = CarouselDataItem> {
  data: PatternData<TItem, CarouselDataState>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSlide?: (slide: ReactCarouselSlide, dataItem: TItem) => ReactNode
}

export function Carousel<TItem extends CarouselDataItem = CarouselDataItem>({ data, onEvent, options, className, renderSlide }: CarouselProps<TItem>) {
  const carousel = useCarouselPattern(data, onEvent, options)

  return createElement('div', { ...carousel.rootProps, className } as DivProps, [
    createElement('button', { key: 'prev', ...carousel.prevProps } as ButtonProps, data.items.prev?.label ?? 'Previous'),
    createElement('button', { key: 'next', ...carousel.nextProps } as ButtonProps, data.items.next?.label ?? 'Next'),
    ...carousel.slides.map((slide) => renderCarouselSlide({ slide, dataItem: data.items[slide.key], renderSlide })),
    carousel.showDots
      ? createElement(
          'div',
          { key: 'pickers' } as DivProps,
          carousel.slides.map((slide) =>
            createElement('button', { key: slide.key, ...slide.pickerProps } as ButtonProps & { key: Key }, data.items[slide.key]?.label ?? slide.title),
          ),
        )
      : null,
  ])
}

function renderCarouselSlide<TItem extends CarouselDataItem>({
  slide,
  dataItem,
  renderSlide,
}: {
  slide: ReactCarouselSlide
  dataItem: TItem
  renderSlide?: (slide: ReactCarouselSlide, dataItem: TItem) => ReactNode
}) {
  return createElement('div', { key: slide.key, ...slide.slideProps } as DivProps & { key: Key }, renderSlide?.(slide, dataItem) ?? renderDefaultSlide(slide))
}

function renderDefaultSlide(slide: ReactCarouselSlide) {
  return [
    slide.imageUrl ? createElement('img', { key: 'image', src: slide.imageUrl, alt: slide.imageAlt } as ImgProps) : null,
    createElement('strong', { key: 'title' }, slide.title),
    slide.caption ? createElement('span', { key: 'caption' }, slide.caption) : null,
  ]
}
