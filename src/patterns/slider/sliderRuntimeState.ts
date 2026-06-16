import type { Key, PatternData, PatternItem } from '../../schema'
import type { PatternRuntime } from '../../kernel/patternRuntime'

export type SliderPatternData = PatternData<PatternItem & {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}>

export function getSliderRuntimeState(runtime: PatternRuntime<SliderPatternData>): {
  activeKey: Key | null
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
} {
  return {
    activeKey: runtime.data.state?.activeKey ?? null,
    valueByKey: runtime.data.state?.valueByKey ?? {},
  }
}

export function isMultiThumbSlider(runtime: PatternRuntime<SliderPatternData>): boolean {
  return runtime.visibleKeys.length >= 2 && runtime.visibleKeys.every((key) => {
    const item = runtime.data.items[key]
    return typeof item?.valuemin === 'number' || typeof item?.valuemax === 'number'
  })
}
