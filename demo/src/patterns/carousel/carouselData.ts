import type { PatternData } from '../../../../src/react'

export type CarouselSlide = {
  key: string
  title: string
  caption: string
  imageUrl: string
  imageAlt: string
}

export const carouselSlides: readonly CarouselSlide[] = [
  {
    key: 'slide1',
    title: 'Ridgeline',
    caption: 'Open mountain terrain with a long horizon line.',
    imageUrl: 'https://picsum.photos/id/1018/900/520',
    imageAlt: 'Open mountain terrain below a long horizon line.',
  },
  {
    key: 'slide2',
    title: 'Current',
    caption: 'A quiet water scene with layered depth.',
    imageUrl: 'https://picsum.photos/id/1069/900/520',
    imageAlt: 'Quiet water scene with layered depth.',
  },
  {
    key: 'slide3',
    title: 'Shore',
    caption: 'A broad coastal view with soft natural light.',
    imageUrl: 'https://picsum.photos/id/1015/900/520',
    imageAlt: 'Broad coastal view in soft natural light.',
  },
  {
    key: 'slide4',
    title: 'Canopy',
    caption: 'Dense landscape texture framed for scanning.',
    imageUrl: 'https://picsum.photos/id/1039/900/520',
    imageAlt: 'Dense landscape canopy texture.',
  },
]

export const initialCarouselData: PatternData = {
  items: {
    prev: { label: 'Previous Slide' },
    next: { label: 'Next Slide' },
    ...Object.fromEntries(carouselSlides.map((slide, index) => [slide.key, { label: `Slide ${index + 1}`, title: slide.title, caption: slide.caption, imageUrl: slide.imageUrl, imageAlt: slide.imageAlt }])),
  },
  relations: {
    rootKeys: carouselSlides.map((slide) => slide.key),
  },
  state: {
    activeKey: carouselSlides[0].key,
    selectedKeys: [carouselSlides[0].key],
  },
  refs: {
    label: 'Featured photos',
  },
}

export type CarouselVariantKey = 'previousNext' | 'tablist'

export const carouselVariants: Record<CarouselVariantKey, { label: string; data: PatternData }> = {
  previousNext: {
    label: 'Previous/Next',
    data: {
      ...initialCarouselData,
      state: { ...initialCarouselData.state, showDots: false },
    },
  },
  tablist: {
    label: 'Tabbed picker',
    data: {
      ...initialCarouselData,
      state: { ...initialCarouselData.state, showDots: true },
    },
  },
}

export const carouselVariantItems = Object.entries(carouselVariants).map(([key, value]) => ({ key: key as CarouselVariantKey, label: value.label }))
