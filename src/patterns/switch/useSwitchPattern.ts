import type { KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { switchDefinition } from './definition'

export interface ReactSwitchRenderItem {
  key: Key
  label: string
  state: {
    checked: boolean
    disabled: boolean
  }
  switchProps: ReactPatternProps
}

export interface ReactSwitchRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSwitchRenderItem[]
  state: {
    activeKey: Key | null
    checkedByKey: Readonly<Record<Key, boolean | 'mixed'>>
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    check(key: Key, checked: boolean): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSwitchPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSwitchRuntime {
  const runtime = createPatternRuntime({
    definition: switchDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'switch-'}${key}`,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSwitchRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        checkedByKey: runtime.data.state?.checkedByKey ?? {},
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        check: (key: Key, checked: boolean) => runtime.emit({ type: 'check', key, checked }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createSwitchRenderItem(runtime: PatternRuntime, key: Key): ReactSwitchRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('switch', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'switch')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      checked: state.checked === true,
      disabled: Boolean(state.disabled),
    },
    switchProps: {
      ...props,
      tabIndex: 0,
      onKeyDown: (event) => handleSwitchKeyDown(runtime, key, event),
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
  }
}

function handleSwitchKeyDown(runtime: PatternRuntime, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(event, key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}
