import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternItem, PatternStateWithOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

interface CarouselItem extends PatternItem {
  title?: unknown
  caption?: unknown
  imageUrl?: unknown
  imageAlt?: unknown
}

interface CarouselState extends PatternStateWithOptions {
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

export function createCarouselSlides({
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
