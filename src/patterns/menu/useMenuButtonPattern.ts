import { useLayoutEffect, type KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternEventReason, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'
import { createMenuButtonItem, type ReactMenuButtonItem } from './menuButtonItem'
import { resolveMenuButtonKey } from './menuButtonKeyboard'
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
  const focusStrategy = options?.focusStrategy ?? (data.state?.focusStrategy === 'ariaActiveDescendant' ? 'ariaActiveDescendant' : 'rovingTabIndex')
  const runtimeOptions = { ...(options ?? {}), focusStrategy } satisfies PatternOptions
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const itemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []
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
      if (!triggerKey) return {}
      const props = reactProps(runtime.getPartProps('trigger', triggerKey))
      const disabled = Boolean(runtime.getItemState(triggerKey, 'trigger').disabled)
      return {
        ...props,
        id: runtime.keyToElementId(triggerKey),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (disabled) {
            props.onKeyDown?.(event)
            return
          }
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
          if (expanded && event.key === 'Escape') {
            event.preventDefault()
            onEvent(withDefaultReason({ type: 'expand', key: triggerKey, expanded: false }, 'keyboard'))
            return
          }
          props.onKeyDown?.(event)
        },
      }
    },
    get menuProps() {
      if (!menuKey || !triggerKey) return {}
      const props = reactProps(runtime.getPartProps('menu', menuKey))
      const rootKeyDown = createReactKeyboardHandler(runtime.getRootKeyboardHandler())
      return {
        ...props,
        tabIndex: focusStrategy === 'ariaActiveDescendant' ? 0 : -1,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            closeAndFocusTrigger('keyboard')
            return
          }
          if (event.key === 'Tab') {
            onEvent({ type: 'expand', key: triggerKey, expanded: false, meta: { reason: 'keyboard' } })
            return
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activateActiveItem('keyboard')
            return
          }
          const nextKey = resolveMenuButtonKey(event.key, itemKeys, data.state?.activeKey, data)
          if (nextKey) {
            event.preventDefault()
            onEvent({ type: 'focus', key: nextKey, meta: { reason: 'keyboard' } })
            return
          }
          rootKeyDown(event)
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
