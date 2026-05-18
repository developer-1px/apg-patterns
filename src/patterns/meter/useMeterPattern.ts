import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { meterDefinition } from './definition'
import { createMeterRenderItem, type ReactMeterRenderItem } from './meterRenderItem'
export type { ReactMeterRenderItem } from './meterRenderItem'

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

export function useMeterPattern(data: PatternDataWithOptions, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMeterRuntime {
  const runtimeOptions = options ?? data.state?.options ?? {}
  const runtime = createPatternRuntime({
    definition: meterDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'meter-'}${key}`,
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
