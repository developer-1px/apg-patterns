import type { KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { switchDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const keyToElementId = usePatternElementId(options, 'switch-')
  const runtime = createPatternRuntime({
    definition: switchDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
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
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('switch', key))
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
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => dispatchReactKeyboardBinding(runtime, key, event),
      onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
    },
  }
}
