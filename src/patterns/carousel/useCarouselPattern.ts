import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { getCarouselRuntimeState } from './carouselRuntimeState'
import { createCarouselSlides, type ReactCarouselSlide } from './carouselSlide'
import { carouselDefinition } from './definition'

interface CarouselItem extends PatternItem {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
}

interface CarouselState extends PatternStateWithOptions {
  showDots?: boolean
}

type CarouselData = PatternData<CarouselItem, CarouselState>

export type { ReactCarouselSlide } from './carouselSlide'

export interface ReactCarouselRuntime {
  rootProps: ReactPatternProps
  prevProps: ReactPatternProps
  nextProps: ReactPatternProps
  slides: readonly ReactCarouselSlide[]
  activeKey: Key | null
  showDots: boolean
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useCarouselPattern(data: CarouselData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactCarouselRuntime {
  const runtimeOptions = {
    roledescription: 'carousel',
    slideRoledescription: 'slide',
    ...(options ?? data.state?.options ?? {}),
  } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: carouselDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'carousel-'}${key}`,
  })
  const { activeKey, showDots, slideKeys } = getCarouselRuntimeState(data)

  return {
    get rootProps() {
      return reactProps(runtime.getPartProps('root'))
    },
    get prevProps() {
      return reactProps(runtime.getPartProps('prev', 'prev'))
    },
    get nextProps() {
      return reactProps(runtime.getPartProps('next', 'next'))
    },
    get slides() {
      return createCarouselSlides({ runtime, data, slideKeys, activeKey })
    },
    activeKey,
    showDots,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
