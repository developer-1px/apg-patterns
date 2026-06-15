import { useLayoutEffect } from 'react'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'
import { createMenuButtonItem, type ReactMenuButtonItem } from './menuButtonItem'
import { createMenuButtonMenuProps } from './menuButtonMenuProps'
import { createMenuButtonTriggerProps } from './menuButtonTriggerProps'
import { getMenuButtonRuntimeState } from './menuButtonRuntimeState'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

registerKernelBuiltins()

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

  const closeAndFocusTrigger = () => {
    if (!triggerKey) return
    onEvent({ type: 'expand', key: triggerKey, expanded: false })
    document.getElementById(runtime.keyToElementId(triggerKey))?.focus({ preventScroll: true })
  }
  const activateActiveItem = () => {
    const activeKey = data.state?.activeKey && itemKeys.includes(data.state.activeKey) ? data.state.activeKey : itemKeys[0]
    if (!activeKey) return
    onEvent({ type: 'activate', key: activeKey })
    closeAndFocusTrigger()
  }

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
