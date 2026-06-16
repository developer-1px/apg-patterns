import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternState } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { carouselDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface CarouselItem extends PatternItem {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
}

interface CarouselState extends PatternState {
  showDots?: boolean
}

type CarouselData = PatternData<CarouselItem, CarouselState>

export interface ReactCarouselSlide {
  key: Key
  title: string
  caption: string
  imageUrl: string | null
  imageAlt: string
  active: boolean
  index: number
  slideProps: ReactPatternProps
  pickerProps: ReactPatternProps
}

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

export function useCarouselPattern(data: PatternData<CarouselItem, CarouselState>, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactCarouselRuntime {
  const runtimeOptions = {
    roledescription: 'carousel',
    slideRoledescription: 'slide',
    ...(options ?? {}),
  } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'carousel-')
  const runtime = createPatternRuntime({
    definition: carouselDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const slideKeys = data.relations?.rootKeys ?? []
  const activeKey = data.state?.activeKey ?? slideKeys[0] ?? null
  const showDots = (data.state?.showDots ?? true) === true

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

function createCarouselSlides({
  runtime,
  data,
  slideKeys,
  activeKey,
}: {
  runtime: PatternRuntime<CarouselData>
  data: CarouselData
  slideKeys: readonly Key[]
  activeKey: Key | null
}): readonly ReactCarouselSlide[] {
  return slideKeys.map((key, index) => {
    const item = data.items[key]
    return {
      key,
      title: String(item?.title ?? data.items[key]?.label ?? key),
      caption: String(item?.caption ?? ''),
      imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : null,
      imageAlt: String(item?.imageAlt ?? item?.caption ?? item?.title ?? data.items[key]?.label ?? key),
      active: key === activeKey,
      index,
      slideProps: reactProps(runtime.getPartProps('slide', key)),
      pickerProps: reactProps(runtime.getPartProps('picker', key)),
    }
  })
}
