import type { Key } from '../../schema'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { SliderData } from './contract'

export function getSliderRuntimeState(runtime: PatternRuntime<SliderData>): {
  activeKey: Key | null
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
} {
  return {
    activeKey: runtime.data.state?.activeKey ?? null,
    valueByKey: runtime.data.state?.valueByKey ?? {},
  }
}

export function isMultiThumbSlider(runtime: PatternRuntime<SliderData>): boolean {
  return runtime.visibleKeys.length >= 2 && runtime.visibleKeys.every((key) => {
    const item = runtime.data.items[key]
    return typeof item?.valuemin === 'number' || typeof item?.valuemax === 'number'
  })
}
