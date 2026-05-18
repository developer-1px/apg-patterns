import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { toolbarDefinition } from './definition'
import { createToolbarActions } from './toolbarActions'
import { createToolbarRenderItem, type ReactToolbarRenderItem } from './toolbarRenderItem'
import { createToolbarRootProps } from './toolbarRootProps'
import { getToolbarRuntimeState } from './toolbarRuntimeState'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactToolbarRenderItem } from './toolbarRenderItem'

export interface ReactToolbarRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactToolbarRenderItem[]
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

export function useToolbarPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactToolbarRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', orientation: 'horizontal', ...options }
  const keyToElementId = usePatternElementId(mergedOptions, 'toolbar-item-')
  const runtime = useReactPatternRuntime({
    definition: toolbarDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: createToolbarRootProps(runtime),
    get renderItems() {
      return runtime.visibleKeys.map((key) => createToolbarRenderItem(runtime, key))
    },
    get state() {
      return getToolbarRuntimeState(runtime.data)
    },
    get actions() {
      return createToolbarActions(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
