import type { KeyboardEvent } from 'react'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { Key, PatternEventReason } from '../../schema'
import { resolveMenuButtonKey } from './menuButtonKeyboard'
import type { MenuButtonPropsInput } from './menuButtonPropsInput'

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
  closeAndFocusTrigger: (reason?: PatternEventReason) => void
  activateActiveItem: (reason?: PatternEventReason) => void
}): ReactPatternProps {
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
}
