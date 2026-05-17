import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { carouselDefinition } from './definition'

export interface ReactCarouselSlide {
  key: Key
  title: string
  caption: string
  imageUrl: string | null
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

export function useCarouselPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactCarouselRuntime {
  const runtimeOptions = {
    roledescription: 'carousel',
    slideRoledescription: 'slide',
    ...(options ?? ((data.state as { options?: PatternOptions } | undefined)?.options ?? {})),
  } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: carouselDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'carousel-'}${key}`,
  })
  const slideKeys = data.relations?.rootKeys ?? []
  const activeKey = data.state?.activeKey ?? slideKeys[0] ?? null

  return {
    get rootProps() {
      return runtime.getPartProps('root') as ReactPatternProps
    },
    get prevProps() {
      return runtime.getPartProps('prev', 'prev') as ReactPatternProps
    },
    get nextProps() {
      return runtime.getPartProps('next', 'next') as ReactPatternProps
    },
    get slides() {
      return slideKeys.map((key, index) => {
        const item = data.items[key] as { title?: unknown; caption?: unknown; imageUrl?: unknown } | undefined
        return {
          key,
          title: String(item?.title ?? data.items[key]?.label ?? key),
          caption: String(item?.caption ?? ''),
          imageUrl: typeof item?.imageUrl === 'string' ? item.imageUrl : null,
          active: key === activeKey,
          index,
          slideProps: runtime.getPartProps('slide', key) as ReactPatternProps,
          pickerProps: runtime.getPartProps('picker', key) as ReactPatternProps,
        }
      })
    },
    activeKey,
    showDots: ((data.state as { showDots?: boolean } | undefined)?.showDots ?? true) === true,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
