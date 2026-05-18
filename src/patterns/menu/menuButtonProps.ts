import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { resolveMenuButtonKey } from './menuButtonKeyboard'

interface MenuButtonPropsInput {
  runtime: PatternRuntime
  data: PatternData
  triggerKey: Key | null
  itemKeys: readonly Key[]
  onEvent: (event: PatternEvent) => void
}

export function createMenuButtonTriggerProps({
  runtime,
  triggerKey,
  itemKeys,
  expanded,
  onEvent,
}: MenuButtonPropsInput & { expanded: boolean }): ReactPatternProps {
  if (!triggerKey) return {}
  const props = reactProps(runtime.getPartProps('trigger', triggerKey))
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
}

export function createMenuButtonMenuProps({
  runtime,
  data,
  triggerKey,
  menuKey,
  itemKeys,
  focusStrategy,
  onEvent,
  closeAndFocusTrigger,
  activateActiveItem,
}: MenuButtonPropsInput & {
  menuKey: Key | null
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  closeAndFocusTrigger: () => void
  activateActiveItem: () => void
}): ReactPatternProps {
  if (!menuKey || !triggerKey) return {}
  const props = reactProps(runtime.getPartProps('menu', menuKey))
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
        onEvent({ type: 'expand', key: triggerKey, expanded: false, meta: { reason: 'keyboard' } })
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
}
