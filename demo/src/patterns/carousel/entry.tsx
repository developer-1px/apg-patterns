import { Carousel } from './Carousel'
import { initialCarouselData } from './carouselData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'carousel',
  label: 'Carousel',
  useDemoPattern: (_onEvent) => {
    return {
      key: 'carousel',
      label: 'Carousel',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Tab', 'Enter', 'Space'],
      sourceNames: ['Carousel.tsx', 'carouselData.ts', 'carousel/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(initialCarouselData),
      preview: <Carousel />,
      // stateless — no reset
    }
  },
}
