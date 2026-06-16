import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { meterDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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

export interface ReactMeterRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactMeterRenderItem[]
  state: {
    valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useMeterPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMeterRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'meter-')
  const runtime = createPatternRuntime({
    definition: meterDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createMeterRenderItem(runtime, key))
    },
    get state() {
      return {
        valueByKey: runtime.data.state?.valueByKey ?? {},
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createMeterRenderItem(runtime: PatternRuntime, key: Key): ReactMeterRenderItem {
  const item = runtime.data.items[key]
  const value = Number(runtime.data.state?.valueByKey?.[key] ?? 0)
  const min = Number(item?.valuemin ?? runtime.options.min ?? 0)
  const max = Number(item?.valuemax ?? runtime.options.max ?? 100)
  const valueText = typeof item?.valuetext === 'string' ? item.valuetext : undefined
  const ratio = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)))
  return {
    key,
    label: item?.label ?? key,
    value,
    min,
    max,
    ratio,
    percent: ratio * 100,
    valueText,
    meterProps: reactProps({
      ...runtime.getPartProps('meter', key),
      'aria-valuemin': min,
      'aria-valuemax': max,
    }),
  }
}
