import { useLayoutEffect, type KeyboardEvent, type MouseEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactKeyInput, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { menuButtonDefinition } from './definition'

export interface ReactMenuButtonItem {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active' | 'disabled'>
  itemProps: ReactPatternProps
}

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
      if (!menuKey) return {}
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
      return itemKeys.map((key) => {
        const itemProps = runtime.getPartProps('menuitem', key) as ReactPatternProps
        const state = runtime.getItemState(key, 'menuitem')
        return {
          key,
          label: data.items[key]?.label ?? key,
          state: {
            active: Boolean(state.active),
            disabled: Boolean(state.disabled),
          },
          itemProps: {
            ...itemProps,
            id: runtime.keyToElementId(key),
            onFocus: () => onEvent({ type: 'focus', key }),
            onClick: (event: MouseEvent<HTMLElement>) => {
              itemProps.onClick?.(event)
              closeAndFocusTrigger()
            },
          },
        }
      })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function resolveMenuButtonKey(key: string, keys: readonly string[], activeKey: string | null | undefined, data: PatternData) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (key === 'ArrowDown') return keys[(index + 1 + keys.length) % keys.length]
  if (key === 'ArrowUp') return keys[(index - 1 + keys.length) % keys.length]
  if (key === 'Home') return keys[0]
  if (key === 'End') return keys[keys.length - 1]
  if (key.length === 1 && /\S/.test(key)) return resolveMenuButtonTypeaheadKey(key, keys, index, data)
  return undefined
}

function resolveMenuButtonTypeaheadKey(key: string, keys: readonly string[], activeIndex: number, data: PatternData) {
  const query = key.toLocaleLowerCase()
  for (let offset = 1; offset <= keys.length; offset += 1) {
    const candidate = keys[(activeIndex + offset + keys.length) % keys.length]!
    const label = data.items[candidate]?.label ?? candidate
    if (label.toLocaleLowerCase().startsWith(query)) return candidate
  }
  return undefined
}
