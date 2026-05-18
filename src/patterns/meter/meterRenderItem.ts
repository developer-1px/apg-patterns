import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactMeterRenderItem {
  key: Key
  label: string
  value: number
  min: number
  max: number
  ratio: number
  percent: number
  valueText?: string
  meterProps: ReactPatternProps
}

export function createMeterRenderItem(runtime: PatternRuntime, key: Key): ReactMeterRenderItem {
  const item = runtime.data.items[key]
  const value = Number(runtime.data.state?.valueByKey?.[key] ?? 0)
  const itemRange = item as { valuemin?: number; valuemax?: number; valuetext?: string } | undefined
  const min = Number(itemRange?.valuemin ?? runtime.options.min ?? 0)
  const max = Number(itemRange?.valuemax ?? runtime.options.max ?? 100)
  const ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)))
  return {
    key,
    label: item?.label ?? key,
    value,
    min,
    max,
    ratio,
    percent: ratio * 100,
    valueText: itemRange?.valuetext,
    meterProps: {
      ...(runtime.getPartProps('meter', key) as ReactPatternProps),
      'aria-valuemin': min,
      'aria-valuemax': max,
    } as ReactPatternProps,
  }
}
