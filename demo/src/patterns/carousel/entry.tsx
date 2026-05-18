import { reducePatternData } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { Carousel } from './Carousel'
import { initialCarouselData } from './carouselData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const carouselDemoDefinition = {
  key: 'carousel',
  label: 'Carousel',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Tab', 'Enter', 'Space'],
  sources: {
    main: 'Carousel.tsx',
    entry: 'carousel/entry.tsx',
    hooks: ['carousel/useCarouselPattern.ts'],
    data: ['carouselData.ts'],
    definition: 'carousel/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Carousel',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: carouselDemoDefinition,
  initialData: initialCarouselData,
  reduce: (data, event) => reducePatternData(carouselDefinition, data, event),
  componentName: 'Carousel',
  component: Carousel,
})
