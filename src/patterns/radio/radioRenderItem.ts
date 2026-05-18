import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'

export interface ReactRadioRenderItem {
  key: Key
  label: string
  state: ReactRenderItemState & { checked: boolean }
  radioProps: ReactPatternProps
}

export function createRadioRenderItem(runtime: PatternRuntime, key: Key): ReactRadioRenderItem {
  const state = runtime.getItemState(key, 'radio')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.checked),
      checked: Boolean(state.checked),
      disabled: Boolean(state.disabled),
    },
    radioProps: runtime.getPartProps('radio', key) as ReactPatternProps,
  }
}
