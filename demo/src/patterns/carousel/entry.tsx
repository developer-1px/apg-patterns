import { Carousel } from './Carousel'
import { initialCarouselData } from './carouselData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'carousel',
  label: 'Carousel',
  order: 16,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'carousel',
      label: 'Carousel',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Tab', 'Enter', 'Space'],
      sourceNames: ['Carousel.tsx', 'carouselData.ts', 'carousel/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialCarouselData),
      preview: <Carousel />,
      reset: () => {},
    }
  },
}
