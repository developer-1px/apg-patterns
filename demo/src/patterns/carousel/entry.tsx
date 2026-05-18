import { reducePatternData } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { Carousel } from './Carousel'
import { carouselVariantItems, carouselVariants, initialCarouselData, type CarouselVariantKey } from './carouselData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

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
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'carousel variants',
    idPrefix: 'carousel-variant',
    onChange: '$actions.selectVariant',
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

export const entry = defineVariantDemoPattern<CarouselVariantKey>({
  definition: carouselDemoDefinition,
  initialVariant: 'previousNext',
  initialData: initialCarouselData,
  dataByVariant: (variant) => carouselVariants[variant].data,
  reduce: (_variant, data, event) => reducePatternData(carouselDefinition, data, event),
  variantItems: carouselVariantItems,
  componentName: 'Carousel',
  component: Carousel,
})
