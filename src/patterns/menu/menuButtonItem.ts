import type { MouseEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'

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
  closeAndFocusTrigger(): void
}): ReactMenuButtonItem {
  const itemProps = reactProps(runtime.getPartProps('menuitem', key))
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
}
