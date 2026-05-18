import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'

export interface ReactToolbarRenderItem {
  key: Key
  label: string
  state: ReactRenderItemState & { pressed: boolean }
  itemProps: ReactPatternProps
}

export function createToolbarRenderItem(runtime: PatternRuntime, key: Key): ReactToolbarRenderItem {
  const state = runtime.getItemState(key, 'item')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.pressed),
      pressed: Boolean(state.pressed),
      disabled: Boolean(state.disabled),
    },
    itemProps: reactProps(runtime.getPartProps('item', key)),
  }
}
