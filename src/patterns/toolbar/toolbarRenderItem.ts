import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'

export type ReactToolbarItemKind = 'button' | 'toggleButton' | 'select' | 'colorInput' | 'menuButton' | 'custom'

export interface ReactToolbarRenderItem {
  key: Key
  label: string
  kind: ReactToolbarItemKind
  state: ReactRenderItemState & { pressed: boolean }
  itemProps: ReactPatternProps
}

export function createToolbarRenderItem(runtime: PatternRuntime, key: Key): ReactToolbarRenderItem {
  const rawKind = runtime.data.items[key]?.kind
  const kind: ReactToolbarItemKind = rawKind === 'toggleButton' || rawKind === 'select' || rawKind === 'colorInput' || rawKind === 'menuButton' || rawKind === 'custom'
    ? rawKind
    : 'button'
  const part = kind === 'button' || kind === 'toggleButton' ? 'item' : 'control'
  const state = runtime.getItemState(key, part)
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    kind,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.pressed),
      pressed: Boolean(state.pressed),
      disabled: Boolean(state.disabled),
    },
    itemProps: part === 'control'
      ? createToolbarControlProps(runtime, key)
      : reactProps(runtime.getPartProps('item', key)),
  }
}

function createToolbarControlProps(runtime: PatternRuntime, key: Key): ReactPatternProps {
  const { role: _role, ...props } = reactProps(runtime.getPartProps('control', key))
  return props
}
