import { createPatternRuntime } from '../../kernel/patternRuntime'
import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternItem } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { SliderOptionsSchema, type SliderOptions } from './contract'
import { sliderDefinition } from './definition'
import { createSliderRenderItem, type ReactSliderRenderItem } from './sliderRenderItem'
import { getSliderRuntimeState, isMultiThumbSlider } from './sliderRuntimeState'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactSliderRenderItem } from './sliderRenderItem'

type SliderPatternData = PatternData<PatternItem & {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}>

export interface ReactSliderRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSliderRenderItem[]
  orientation: 'horizontal' | 'vertical'
  isMultiThumb: boolean
  state: {
    activeKey: Key | null
    valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSliderPattern(data: SliderPatternData, onEvent: (event: PatternEvent) => void, options?: SliderOptions): ReactSliderRuntime {
  const parsedData = PatternDataSchema.parse(data) as SliderPatternData
  const runtimeOptions = SliderOptionsSchema.parse(options ?? {})
  const keyToElementId = usePatternElementId(runtimeOptions, 'slider-')
  const runtime = createPatternRuntime({
    definition: sliderDefinition,
    data: parsedData,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const orientation = runtimeOptions.orientation === 'vertical' ? 'vertical' : 'horizontal'

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSliderRenderItem(runtime, key, orientation))
    },
    orientation,
    get isMultiThumb() {
      return isMultiThumbSlider(runtime)
    },
    get state() {
      return getSliderRuntimeState(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
