import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { radioGroupDefinition } from './definition'
import { createRadioGroupActions } from './radioGroupActions'
import { createRadioRenderItem, type ReactRadioRenderItem } from './radioRenderItem'
import { createRadioGroupRootProps } from './radioGroupRootProps'
import { getRadioGroupRuntimeState } from './radioGroupRuntimeState'
export type { ReactRadioRenderItem } from './radioRenderItem'

export interface ReactRadioGroupRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactRadioRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useRadioGroupPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactRadioGroupRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', ...options }
  const runtime = useReactPatternRuntime({
    definition: radioGroupDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? 'radio-'}${key}`,
  })

  return {
    rootProps: createRadioGroupRootProps(runtime),
    get renderItems() {
      return runtime.visibleKeys.map((key) => createRadioRenderItem(runtime, key))
    },
    get state() {
      return getRadioGroupRuntimeState(runtime.data)
    },
    get actions() {
      return createRadioGroupActions(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
