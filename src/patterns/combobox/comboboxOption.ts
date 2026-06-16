import type { MouseEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { comboboxRootKey } from './navigation'

export interface ReactComboboxOption {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active' | 'selected'>
  optionProps: ReactPatternProps
}

export function createComboboxOption({
  runtime,
  data,
  key,
  open,
  editable,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  open: boolean
  editable: boolean
  onEvent: (event: PatternEvent) => void
}): ReactComboboxOption {
  const optionProps = reactProps(runtime.getPartProps('option', key))
  const state = runtime.getItemState(key, 'option')
  const active = Boolean(state.active)
  const selected = Boolean(state.selected)
  return {
    key,
    label: data.items[key]?.label ?? key,
    state: {
      active,
      selected,
    },
    optionProps: {
      ...optionProps,
      'aria-selected': open ? active : selected,
      onMouseDown: (event: MouseEvent<HTMLElement>) => {
        event.preventDefault()
        onEvent(withDefaultReason({ type: 'select', keys: [key], anchorKey: key, extentKey: key }, 'pointer'))
        onEvent(withDefaultReason({ type: 'expand', key: comboboxRootKey, expanded: false }, 'pointer'))
        if (editable) onEvent(withDefaultReason({ type: 'commitValue', key, value: data.items[key]?.label ?? '' }, 'pointer'))
      },
    },
  }
}
