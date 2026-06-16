import type { KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { checkboxDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const keyToElementId = usePatternElementId(options, 'checkbox-')
  const runtime = createPatternRuntime({
    definition: checkboxDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
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
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('checkbox', key))
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
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => dispatchReactKeyboardBinding(runtime, key, event),
      onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
    },
  }
}
