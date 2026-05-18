import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { sliderContract, type SliderData, type SliderOptions } from './contract'
import { createSliderRenderItem, type ReactSliderRenderItem } from './sliderRenderItem'
import { getSliderRuntimeState, isMultiThumbSlider } from './sliderRuntimeState'
export type { ReactSliderRenderItem } from './sliderRenderItem'

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

export function useSliderPattern(data: SliderData, onEvent: (event: PatternEvent) => void, options?: SliderOptions): ReactSliderRuntime {
  const parsedData = sliderContract.parseData(data)
  const runtimeOptions = sliderContract.parseOptions(options ?? parsedData.state?.options)
  const runtime = createPatternRuntime({
    definition: sliderContract.definition,
    data: parsedData,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'slider-'}${key}`,
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
