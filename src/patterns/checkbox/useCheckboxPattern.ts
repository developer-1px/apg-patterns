import type { KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { checkboxDefinition } from './definition'

export interface ReactCheckboxRenderItem {
  key: Key
  label: string
  state: {
    checked: boolean | 'mixed'
    disabled: boolean
  }
  checkboxProps: ReactPatternProps
}

export interface ReactCheckboxRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactCheckboxRenderItem[]
  state: {
    activeKey: Key | null
    checkedByKey: Readonly<Record<Key, boolean | 'mixed'>>
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    check(key: Key, checked: boolean | 'mixed'): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useCheckboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactCheckboxRuntime {
  const runtime = createPatternRuntime({
    definition: checkboxDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'checkbox-'}${key}`,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createCheckboxRenderItem(runtime, key))
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
        check: (key: Key, checked: boolean | 'mixed') => runtime.emit({ type: 'check', key, checked }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createCheckboxRenderItem(runtime: PatternRuntime, key: Key): ReactCheckboxRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('checkbox', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'checkbox')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      checked: state.checked === 'mixed' ? 'mixed' : Boolean(state.checked),
      disabled: Boolean(state.disabled),
    },
    checkboxProps: {
      ...props,
      tabIndex: 0,
      onKeyDown: (event) => handleCheckboxKeyDown(runtime, key, event),
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
  }
}

function handleCheckboxKeyDown(runtime: PatternRuntime, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(event as unknown as KeyInput, key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}
