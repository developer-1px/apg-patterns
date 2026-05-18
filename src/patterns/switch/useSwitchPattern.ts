import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createSwitchActions } from './switchActions'
import { switchDefinition } from './definition'
import { createSwitchRenderItem, type ReactSwitchRenderItem } from './switchRenderItem'
import { getSwitchRuntimeState } from './switchRuntimeState'
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
  const runtime = createPatternRuntime({
    definition: switchDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'switch-'}${key}`,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSwitchRenderItem(runtime, key))
    },
    get state() {
      return getSwitchRuntimeState(runtime.data)
    },
    get actions() {
      return createSwitchActions(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
