import type { KeyboardEvent, PointerEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { sliderDefinition } from './definition'

export interface ReactSliderRenderItem {
  key: Key
  label: string
  value: number
  min: number
  max: number
  step: number
  position: number
  valueText?: string
  sliderProps: ReactPatternProps
  updateFromPointer(event: PointerEvent<HTMLElement>): void
}

export interface ReactSliderRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSliderRenderItem[]
  orientation: 'horizontal' | 'vertical'
  isMultiThumb: boolean
  state: {
    activeKey: Key | null
    valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSliderPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSliderRuntime {
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: sliderDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'slider-'}${key}`,
  })
  const orientation = runtimeOptions.orientation === 'vertical' ? 'vertical' : 'horizontal'

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSliderRenderItem(runtime, key, orientation))
    },
    orientation,
    get isMultiThumb() {
      return runtime.visibleKeys.length >= 2 && runtime.visibleKeys.every((key) => {
        const item = runtime.data.items[key] as { valuemin?: number; valuemax?: number } | undefined
        return typeof item?.valuemin === 'number' || typeof item?.valuemax === 'number'
      })
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        valueByKey: runtime.data.state?.valueByKey ?? {},
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createSliderRenderItem(runtime: PatternRuntime, key: Key, orientation: 'horizontal' | 'vertical'): ReactSliderRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('slider', key) as ReactPatternProps
  const item = runtime.data.items[key] as { label?: string; valuemin?: number; valuemax?: number; valuetext?: string } | undefined
  const min = Number(item?.valuemin ?? runtime.options.min ?? 0)
  const max = Number(item?.valuemax ?? runtime.options.max ?? 100)
  const step = Number(runtime.options.step ?? 1)
  const value = Number(runtime.data.state?.valueByKey?.[key] ?? min)
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100

  return {
    key,
    label: item?.label ?? key,
    value,
    min,
    max,
    step,
    position,
    valueText: item?.valuetext,
    sliderProps: {
      ...props,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        runtime.emit({ type: 'focus', key })
        const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
        if (!result) return
        if (result.preventDefault) event.preventDefault()
        for (const next of result.events) runtime.emit(next)
      },
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
    updateFromPointer: (event: PointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const ratio = orientation === 'vertical'
        ? rect.height <= 0 ? 0 : Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
        : rect.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
      const raw = min + ratio * (max - min)
      runtime.emit({ type: 'value', key, value: Math.round(raw / step) * step })
    },
  }
}
