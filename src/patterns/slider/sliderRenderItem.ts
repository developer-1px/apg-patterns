import type { KeyboardEvent, PointerEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { SliderData } from './contract'

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

export function createSliderRenderItem(runtime: PatternRuntime<SliderData>, key: Key, orientation: 'horizontal' | 'vertical'): ReactSliderRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('slider', key) as ReactPatternProps
  const item = runtime.data.items[key]
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
