import type { PatternData } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

type CarouselSlide = {
  key: string
  title: string
  imageUrl: string
  imageAlt: string
}

export const carouselSlides: readonly CarouselSlide[] = [
  {
    key: 'slide1',
    title: 'Ridgeline',
    imageUrl: 'https://picsum.photos/id/1018/900/520',
    imageAlt: 'Open mountain terrain below a long horizon line.',
  },
  {
    key: 'slide2',
    title: 'Current',
    imageUrl: 'https://picsum.photos/id/1069/900/520',
    imageAlt: 'Quiet water scene with layered depth.',
  },
  {
    key: 'slide3',
    title: 'Shore',
    imageUrl: 'https://picsum.photos/id/1015/900/520',
    imageAlt: 'Broad coastal view in soft natural light.',
  },
  {
    key: 'slide4',
    title: 'Canopy',
    imageUrl: 'https://picsum.photos/id/1039/900/520',
    imageAlt: 'Dense landscape canopy texture.',
  },
]

export const initialCarouselData: PatternData = {
  items: {
    prev: { label: 'Previous Slide' },
    next: { label: 'Next Slide' },
    ...Object.fromEntries(carouselSlides.map((slide, index) => [slide.key, { label: `Slide ${index + 1}`, title: slide.title, imageUrl: slide.imageUrl, imageAlt: slide.imageAlt }])),
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

export const carouselVariantItems = variantItemsFrom(carouselVariants)
