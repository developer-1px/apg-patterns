import type { KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternValueStepDirection } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { spinbuttonDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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

interface SpinbuttonRuntimeState {
  activeKey: Key | null
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
}

export interface ReactSpinbuttonRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSpinbuttonRenderItem[]
  state: SpinbuttonRuntimeState
  actions: {
    focus(key: Key): void
    step(key: Key, direction: PatternValueStepDirection): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSpinbuttonPattern(data: SpinbuttonData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSpinbuttonRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'spinbutton-')
  const runtime = createPatternRuntime({
    definition: spinbuttonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSpinbuttonRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        valueByKey: runtime.data.state?.valueByKey ?? {},
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        step: (key: Key, direction: PatternValueStepDirection) => {
          runtime.emit({ type: 'focus', key })
          runtime.emit({ type: 'valueStep', key, direction })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createSpinbuttonRenderItem(runtime: PatternRuntime<SpinbuttonData>, key: Key): ReactSpinbuttonRenderItem {
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
      dispatchReactKeyboardBinding(runtime, key, event)
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
