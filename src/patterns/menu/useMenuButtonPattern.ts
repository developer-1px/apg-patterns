import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'
import { createMenuButtonActions } from './menuButtonActions'
import { createMenuButtonItem, type ReactMenuButtonItem } from './menuButtonItem'
import { createMenuButtonMenuProps, createMenuButtonTriggerProps } from './menuButtonProps'
import { getMenuButtonRuntimeState } from './menuButtonRuntimeState'
import { useMenuButtonActiveDescendantFocus } from './useMenuButtonActiveDescendantFocus'

export interface ReactMenuButtonRuntime {
  triggerKey: Key | null
  menuKey: Key | null
  expanded: boolean
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  triggerProps: ReactPatternProps
  menuProps: ReactPatternProps
  items: readonly ReactMenuButtonItem[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useMenuButtonPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMenuButtonRuntime {
  const { focusStrategy, runtimeOptions, triggerKey, menuKey, expanded, itemKeys } = getMenuButtonRuntimeState(data, options)
  const runtime = createPatternRuntime({
    definition: menuButtonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'mb-'}${key}`,
  })

  usePatternEffects({ definition: menuButtonDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  useMenuButtonActiveDescendantFocus({ data, expanded, focusStrategy, menuKey, runtime })

  const { closeAndFocusTrigger, activateActiveItem } = createMenuButtonActions({ data, itemKeys, triggerKey, runtime, onEvent })

  return {
    triggerKey,
    menuKey,
    expanded,
    focusStrategy,
    get triggerProps() {
      return createMenuButtonTriggerProps({ runtime, data, triggerKey, itemKeys, expanded, onEvent })
    },
    get menuProps() {
      return createMenuButtonMenuProps({ runtime, data, triggerKey, menuKey, itemKeys, focusStrategy, onEvent, closeAndFocusTrigger, activateActiveItem })
    },
    get items() {
      return itemKeys.map((key) => createMenuButtonItem({ runtime, data, key, onEvent, closeAndFocusTrigger }))
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
