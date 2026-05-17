import { reducePatternData } from '../../../../src'
import { carouselDefinition } from '../../../../src/patterns/carousel/definition'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Carousel } from './Carousel'
import { initialCarouselData } from './carouselData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'carousel',
  label: 'Carousel',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialCarouselData, (data, event) => reducePatternData(carouselDefinition, data, event))
    return {
      key: 'carousel',
      label: 'Carousel',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Tab', 'Enter', 'Space'],
      sourceNames: ['Carousel.tsx', 'carousel/entry.tsx', 'carousel/useCarouselPattern.ts', 'carouselData.ts', 'carousel/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Carousel data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
