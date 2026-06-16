import { useLayoutEffect } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternEventReason, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'
import { createMenuButtonItem, type ReactMenuButtonItem } from './menuButtonItem'
import { createMenuButtonMenuProps } from './menuButtonMenuProps'
import { createMenuButtonTriggerProps } from './menuButtonTriggerProps'
import { getMenuButtonRuntimeState } from './menuButtonRuntimeState'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactMenuButtonTriggerState {
  disabled: boolean
  expanded: boolean
}

export interface ReactMenuButtonRuntime {
  triggerKey: Key | null
  menuKey: Key | null
  expanded: boolean
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  triggerState: ReactMenuButtonTriggerState
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
  const keyToElementId = usePatternElementId(runtimeOptions, 'mb-')
  const runtime = createPatternRuntime({
    definition: menuButtonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  usePatternEffects({ definition: menuButtonDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  useMenuButtonActiveDescendantFocus({ data, expanded, focusStrategy, menuKey, runtime })

  const closeAndFocusTrigger = (reason: PatternEventReason = 'external') => {
    if (!triggerKey) return
    onEvent(withDefaultReason({ type: 'expand', key: triggerKey, expanded: false }, reason))
    document.getElementById(runtime.keyToElementId(triggerKey))?.focus({ preventScroll: true })
  }
  const activateActiveItem = (reason: PatternEventReason = 'external') => {
    const activeKey = data.state?.activeKey
    if (!activeKey || !itemKeys.includes(activeKey) || data.state?.disabledKeys?.includes(activeKey)) return
    onEvent(withDefaultReason({ type: 'activate', key: activeKey }, reason))
    closeAndFocusTrigger(reason)
  }

  return {
    triggerKey,
    menuKey,
    expanded,
    focusStrategy,
    get triggerState() {
      if (!triggerKey) return { disabled: false, expanded: false }
      const state = runtime.getItemState(triggerKey, 'trigger')
      return {
        disabled: Boolean(state.disabled),
        expanded: Boolean(state.expanded),
      }
    },
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

function useMenuButtonActiveDescendantFocus({
  data,
  expanded,
  focusStrategy,
  menuKey,
  runtime,
}: {
  data: PatternData
  expanded: boolean
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  menuKey: Key | null
  runtime: PatternRuntime
}): void {
  useLayoutEffect(() => {
    if (focusStrategy !== 'ariaActiveDescendant' || !expanded || !menuKey) return
    const reason = data.state?.lastEventReason
    if (reason !== 'open' && reason !== 'keyboard' && reason !== 'typeahead') return
    document.getElementById(runtime.keyToElementId(menuKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, data.state?.lastEventReason, expanded, focusStrategy, menuKey, runtime])
}
