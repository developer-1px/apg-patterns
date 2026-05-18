import type { Key, PatternData, PatternItem, PatternStateWithOptions } from '../../schema'

interface CarouselState extends PatternStateWithOptions {
  showDots?: boolean
}

export function getCarouselRuntimeState(data: PatternData<PatternItem, CarouselState>): {
  activeKey: Key | null
  showDots: boolean
  slideKeys: readonly Key[]
} {
  const slideKeys = data.relations?.rootKeys ?? []
  return {
    activeKey: data.state?.activeKey ?? slideKeys[0] ?? null,
    showDots: (data.state?.showDots ?? true) === true,
    slideKeys,
  }
}
