import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternItem } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'

interface SpinbuttonItem extends PatternItem {
  valuemin?: number
  valuemax?: number
}

export type SpinbuttonData = PatternData<SpinbuttonItem>

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
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('spinbutton', key))
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
    spinbuttonProps: createSpinbuttonProps({ key, max, min, props, runtime }),
    decrementButtonProps: createSpinbuttonStepButtonProps({ direction: 'decrement', key, label, runtime }),
    incrementButtonProps: createSpinbuttonStepButtonProps({ direction: 'increment', key, label, runtime }),
  }
}

function createSpinbuttonProps({
  key,
  max,
  min,
  props,
  runtime,
}: {
  key: Key
  max: number
  min: number
  props: ReactPatternProps
  runtime: PatternRuntime<SpinbuttonData>
}): ReactPatternProps {
  return {
    ...props,
    'aria-valuemin': min,
    'aria-valuemax': max,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      runtime.emit(withDefaultReason({ type: 'focus', key }, 'keyboard'))
      const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
      if (!result) return
      if (result.preventDefault) event.preventDefault()
      for (const next of result.events) runtime.emit(withDefaultReason(next, 'keyboard'))
    },
    onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
  }
}

function createSpinbuttonStepButtonProps({
  direction,
  key,
  label,
  runtime,
}: {
  direction: 'decrement' | 'increment'
  key: Key
  label: string
  runtime: PatternRuntime<SpinbuttonData>
}): ReactPatternProps {
  return reactProps({
    type: 'button',
    'aria-label': `${direction === 'decrement' ? 'Decrement' : 'Increment'} ${label}`,
    onClick: () => {
      runtime.emit(withDefaultReason({ type: 'focus', key }, 'pointer'))
      runtime.emit(withDefaultReason({ type: 'valueStep', key, direction }, 'pointer'))
    },
  })
}
