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
  const kind = getToolbarItemKind(runtime.data.items[key]?.kind)
  const part = isToolbarButtonKind(kind) ? 'item' : 'control'
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

function getToolbarItemKind(kind: unknown): ReactToolbarItemKind {
  return kind === 'toggleButton' || kind === 'select' || kind === 'colorInput' || kind === 'menuButton' || kind === 'custom'
    ? kind
    : 'button'
}

function isToolbarButtonKind(kind: ReactToolbarItemKind): boolean {
  return kind === 'button' || kind === 'toggleButton'
}

function createToolbarControlProps(runtime: PatternRuntime, key: Key): ReactPatternProps {
  const { role: _role, ...props } = reactProps(runtime.getPartProps('control', key))
  return props
}
