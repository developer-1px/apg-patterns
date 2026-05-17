import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { radioGroupDefinition } from './definition'

export interface ReactRadioRenderItem {
  key: Key
  label: string
  state: ReactRenderItemState & { checked: boolean }
  radioProps: ReactPatternProps
}

export interface ReactRadioGroupRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactRadioRenderItem[]
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

export function useRadioGroupPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactRadioGroupRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', ...options }
  const runtime = createPatternRuntime({
    definition: radioGroupDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? 'radio-'}${key}`,
  })
  const rootProps = runtime.getPartProps('radiogroup') as ReactPatternProps
  const onKeyDown = runtime.getRootKeyboardHandler()

  return {
    rootProps: {
      ...rootProps,
      onKeyDown: (event) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void }),
    },
    get renderItems() {
      return runtime.visibleKeys.map((key) => createRadioRenderItem(runtime, key))
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
        select: (key: Key) => runtime.emit({ type: 'select', key }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createRadioRenderItem(runtime: PatternRuntime, key: Key): ReactRadioRenderItem {
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
