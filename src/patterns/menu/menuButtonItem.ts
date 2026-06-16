import type { MouseEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternEventReason } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { withMenuItemRoleProps } from './menuItemRole'

export interface ReactMenuButtonItem {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active' | 'disabled'>
  itemProps: ReactPatternProps
}

export function createMenuButtonItem({
  runtime,
  data,
  key,
  onEvent,
  closeAndFocusTrigger,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  onEvent: (event: PatternEvent) => void
  closeAndFocusTrigger(reason?: PatternEventReason): void
}): ReactMenuButtonItem {
  const itemProps = withMenuItemRoleProps(reactProps(runtime.getPartProps('menuitem', key)), data, key)
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
      onFocus: () => onEvent(withDefaultReason({ type: 'focus', key }, 'focus')),
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (state.disabled) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        itemProps.onClick?.(event)
        closeAndFocusTrigger('pointer')
      },
    },
  }
}
