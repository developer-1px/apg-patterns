import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternItem, PatternOptions, PatternState } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { createSpinbuttonProps, createSpinbuttonStepButtonProps } from './spinbuttonProps'

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
