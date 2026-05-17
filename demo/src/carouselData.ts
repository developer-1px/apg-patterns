import type { PatternData } from '../../src'

export type CarouselSlide = {
  key: string
  title: string
  caption: string
  imageUrl: string
}

export const carouselSlides: readonly CarouselSlide[] = [
  {
    key: 'slide1',
    title: 'Hiking',
    caption: 'A hiker enjoys a mountain trail at sunrise.',
    imageUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/images/hiking.jpg',
  },
  {
    key: 'slide2',
    title: 'Jellyfish',
    caption: 'A bioluminescent jellyfish glides through dark water.',
    imageUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/images/jellyfish.jpg',
  },
  {
    key: 'slide3',
    title: 'Beach',
    caption: 'Waves wash over a quiet sandy shoreline.',
    imageUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/images/beach.jpg',
  },
  {
    key: 'slide4',
    title: 'Forest',
    caption: 'Sunlight filters through tall evergreen trees.',
    imageUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/images/forest.jpg',
  },
]

export const initialCarouselData: PatternData = {
  items: Object.fromEntries(
    carouselSlides.map((slide) => [slide.key, { label: slide.title }]),
  ),
  relations: {
    rootKeys: carouselSlides.map((slide) => slide.key),
  },
  state: {
    activeKey: carouselSlides[0].key,
    selectedKeys: [carouselSlides[0].key],
  },
}
