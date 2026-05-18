import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { sliderContract, type SliderData, type SliderOptions } from './contract'
import { createSliderRenderItem, type ReactSliderRenderItem } from './sliderRenderItem'
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
      return runtime.visibleKeys.length >= 2 && runtime.visibleKeys.every((key) => {
        const item = runtime.data.items[key]
        return typeof item?.valuemin === 'number' || typeof item?.valuemax === 'number'
      })
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        valueByKey: runtime.data.state?.valueByKey ?? {},
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
