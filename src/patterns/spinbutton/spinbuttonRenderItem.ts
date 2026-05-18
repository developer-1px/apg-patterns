import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternItem, PatternOptions, PatternState } from '../../schema'
import { reactKeyInput, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'

interface SpinbuttonItem extends PatternItem {
  valuemin?: number
  valuemax?: number
}

interface SpinbuttonState extends PatternState {
  options?: PatternOptions
}

export type SpinbuttonData = PatternData<SpinbuttonItem, SpinbuttonState>

export interface ReactSpinbuttonRenderItem {
  key: Key
  label: string
  value: number
  state: ReactRenderItemState & { value: unknown }
  spinbuttonProps: ReactPatternProps
  decrementButtonProps: ReactPatternProps
  incrementButtonProps: ReactPatternProps
}

export function createSpinbuttonRenderItem(runtime: PatternRuntime<SpinbuttonData>, key: Key): ReactSpinbuttonRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('spinbutton', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'spinbutton')
  const label = runtime.data.items[key]?.label ?? key
  const itemRange = runtime.data.items[key]
  const min = Number(itemRange?.valuemin ?? runtime.options.min ?? 0)
  const max = Number(itemRange?.valuemax ?? runtime.options.max ?? 100)
  return {
    key,
    label,
    value: Number(runtime.data.state?.valueByKey?.[key] ?? 0),
    state: {
      active: Boolean(state.active),
      selected: false,
      disabled: false,
      value: state.value,
    },
    spinbuttonProps: {
      ...props,
      'aria-valuemin': min,
      'aria-valuemax': max,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        runtime.emit({ type: 'focus', key })
        const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
        if (!result) return
        if (result.preventDefault) event.preventDefault()
        for (const next of result.events) runtime.emit(next)
      },
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
    decrementButtonProps: {
      type: 'button',
      'aria-label': `Decrement ${label}`,
      onClick: () => {
        runtime.emit({ type: 'focus', key })
        runtime.emit({ type: 'valueStep', key, direction: 'decrement' })
      },
    } as ReactPatternProps,
    incrementButtonProps: {
      type: 'button',
      'aria-label': `Increment ${label}`,
      onClick: () => {
        runtime.emit({ type: 'focus', key })
        runtime.emit({ type: 'valueStep', key, direction: 'increment' })
      },
    } as ReactPatternProps,
  }
}
