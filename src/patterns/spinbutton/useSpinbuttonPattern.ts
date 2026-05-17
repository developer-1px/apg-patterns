import type { KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions, PatternValueStepDirection } from '../../schema'
import { reactKeyInput, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { spinbuttonDefinition } from './definition'

export interface ReactSpinbuttonRenderItem {
  key: Key
  label: string
  value: number
  state: ReactRenderItemState & { value: unknown }
  spinbuttonProps: ReactPatternProps
  decrementButtonProps: ReactPatternProps
  incrementButtonProps: ReactPatternProps
}

export interface ReactSpinbuttonRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSpinbuttonRenderItem[]
  state: {
    activeKey: Key | null
    valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  }
  actions: {
    focus(key: Key): void
    step(key: Key, direction: PatternValueStepDirection): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSpinbuttonPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSpinbuttonRuntime {
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: spinbuttonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'spinbutton-'}${key}`,
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

function createSpinbuttonRenderItem(runtime: PatternRuntime, key: Key): ReactSpinbuttonRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('spinbutton', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'spinbutton')
  const label = runtime.data.items[key]?.label ?? key
  const itemRange = runtime.data.items[key] as { valuemin?: number; valuemax?: number } | undefined
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
