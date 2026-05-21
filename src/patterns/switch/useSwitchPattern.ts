import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { switchDefinition } from './definition'
import { createSwitchRenderItem, type ReactSwitchRenderItem } from './switchRenderItem'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactSwitchRenderItem } from './switchRenderItem'

export interface ReactSwitchRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSwitchRenderItem[]
  state: {
    activeKey: Key | null
    checkedByKey: Readonly<Record<Key, boolean | 'mixed'>>
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    check(key: Key, checked: boolean): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSwitchPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSwitchRuntime {
  const keyToElementId = usePatternElementId(options, 'switch-')
  const runtime = createPatternRuntime({
    definition: switchDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSwitchRenderItem(runtime, key))
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
        check: (key: Key, checked: boolean) => runtime.emit({ type: 'check', key, checked }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
