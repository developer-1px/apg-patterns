import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createCheckboxRenderItem, type ReactCheckboxRenderItem } from './checkboxRenderItem'
import { checkboxDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactCheckboxRenderItem } from './checkboxRenderItem'

export interface ReactCheckboxRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactCheckboxRenderItem[]
  state: {
    activeKey: Key | null
    checkedByKey: Readonly<Record<Key, boolean | 'mixed'>>
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    check(key: Key, checked: boolean | 'mixed'): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useCheckboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactCheckboxRuntime {
  const keyToElementId = usePatternElementId(options, 'checkbox-')
  const runtime = createPatternRuntime({
    definition: checkboxDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createCheckboxRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        checkedByKey: runtime.data.state?.checkedByKey ?? {},
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        check: (key: Key, checked: boolean | 'mixed') => runtime.emit({ type: 'check', key, checked }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
