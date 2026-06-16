import type { KeyboardEvent } from 'react'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { MenuButtonPropsInput } from './menuButtonPropsInput'

export function createMenuButtonTriggerProps({
  runtime,
  triggerKey,
  itemKeys,
  expanded,
  onEvent,
}: MenuButtonPropsInput & { expanded: boolean }): ReactPatternProps {
  if (!triggerKey) return {}
  const props = reactProps(runtime.getPartProps('trigger', triggerKey))
  const disabled = Boolean(runtime.getItemState?.(triggerKey, 'trigger').disabled)
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
}
