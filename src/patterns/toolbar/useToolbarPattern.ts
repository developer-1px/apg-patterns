import type { KeyInput } from '@interactive-os/keyboard'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { toolbarDefinition } from './definition'

export interface ReactToolbarRenderItem {
  key: Key
  label: string
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
  const runtime = useReactPatternRuntime({
    definition: toolbarDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? 'toolbar-item-'}${key}`,
  })
  const rootProps = runtime.getPartProps('toolbar') as ReactPatternProps
  const onKeyDown = runtime.getRootKeyboardHandler()

  return {
    rootProps: {
      ...rootProps,
      onKeyDown: (event) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void }),
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
    itemProps: runtime.getPartProps('item', key) as ReactPatternProps,
  }
}
