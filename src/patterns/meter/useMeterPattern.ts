import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { meterDefinition } from './definition'
import { createMeterRenderItem, type ReactMeterRenderItem } from './meterRenderItem'
import { usePatternElementId } from '../../adapters/reactDomIds'
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
