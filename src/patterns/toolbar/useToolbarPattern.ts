import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { toolbarDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export type ReactToolbarItemKind = 'button' | 'toggleButton' | 'select' | 'colorInput' | 'menuButton' | 'custom'

export interface ReactToolbarRenderItem {
  key: Key
  label: string
  kind: ReactToolbarItemKind
  state: ReactRenderItemState & { pressed: boolean }
  itemProps: ReactPatternProps
}

export interface ReactToolbarRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactToolbarRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useToolbarPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactToolbarRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', orientation: 'horizontal', ...options }
  const keyToElementId = usePatternElementId(mergedOptions, 'toolbar-item-')
  const runtime = useReactPatternRuntime({
    definition: toolbarDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId,
  })

  return {
    get rootProps() {
      const rootProps = reactProps(runtime.getPartProps('toolbar'))
      const onKeyDown = createReactKeyboardHandler(runtime.getRootKeyboardHandler())
      return {
        ...rootProps,
        onKeyDown,
      }
    },
    get renderItems() {
      return runtime.visibleKeys.map((key) => createToolbarRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createToolbarRenderItem(runtime: PatternRuntime, key: Key): ReactToolbarRenderItem {
  const rawKind = runtime.data.items[key]?.kind
  const kind: ReactToolbarItemKind = rawKind === 'toggleButton' || rawKind === 'select' || rawKind === 'colorInput' || rawKind === 'menuButton' || rawKind === 'custom'
    ? rawKind
    : 'button'
  const part = kind === 'button' || kind === 'toggleButton' ? 'item' : 'control'
  const state = runtime.getItemState(key, part)
  const itemProps = reactProps(runtime.getPartProps(part, key))
  const { role: _role, ...controlProps } = itemProps
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
    itemProps: part === 'control' ? controlProps : itemProps,
  }
}
