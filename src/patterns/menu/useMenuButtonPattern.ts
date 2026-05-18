import { useLayoutEffect, type KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'
import { createMenuButtonItem, type ReactMenuButtonItem } from './menuButtonItem'
import { resolveMenuButtonKey } from './menuButtonKeyboard'

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
  const focusStrategy = data.state?.focusStrategy === 'ariaActiveDescendant' ? 'ariaActiveDescendant' : 'rovingTabIndex'
  const runtimeOptions = { focusStrategy, ...(options ?? {}) } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: menuButtonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'mb-'}${key}`,
  })
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const itemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []

  usePatternEffects({ definition: menuButtonDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  useLayoutEffect(() => {
    if (focusStrategy !== 'ariaActiveDescendant' || !expanded || !menuKey) return
    const reason = data.state?.lastEventReason
    if (reason !== 'open' && reason !== 'keyboard' && reason !== 'typeahead') return
    document.getElementById(runtime.keyToElementId(menuKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, data.state?.lastEventReason, expanded, focusStrategy, menuKey, runtime])

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
      if (!triggerKey) return {}
      const props = runtime.getPartProps('trigger', triggerKey) as ReactPatternProps
      return {
        ...props,
        id: runtime.keyToElementId(triggerKey),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (!expanded && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            onEvent({ type: 'expand', key: triggerKey, expanded: true, meta: { reason: 'open' } })
            if (itemKeys[0]) onEvent({ type: 'focus', key: itemKeys[0], meta: { reason: 'open' } })
            return
          }
          if (!expanded && event.key === 'ArrowUp') {
            event.preventDefault()
            onEvent({ type: 'expand', key: triggerKey, expanded: true, meta: { reason: 'open' } })
            if (itemKeys.length > 0) onEvent({ type: 'focus', key: itemKeys[itemKeys.length - 1]!, meta: { reason: 'open' } })
            return
          }
          props.onKeyDown?.(event)
        },
      }
    },
    get menuProps() {
      if (!menuKey || !triggerKey) return {}
      const props = runtime.getPartProps('menu', menuKey) as ReactPatternProps
      const rootKeyDown = runtime.getRootKeyboardHandler()
      return {
        ...props,
        tabIndex: focusStrategy === 'ariaActiveDescendant' ? 0 : -1,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            closeAndFocusTrigger()
            return
          }
          if (event.key === 'Tab') {
            if (triggerKey) onEvent({ type: 'expand', key: triggerKey, expanded: false, meta: { reason: 'keyboard' } })
            return
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activateActiveItem()
            return
          }
          const nextKey = resolveMenuButtonKey(event.key, itemKeys, data.state?.activeKey, data)
          if (nextKey) {
            event.preventDefault()
            onEvent({ type: 'focus', key: nextKey, meta: { reason: 'keyboard' } })
            return
          }
          rootKeyDown(reactKeyInput(event))
        },
      }
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
