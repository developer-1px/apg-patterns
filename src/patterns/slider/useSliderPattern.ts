import type { KeyboardEvent, PointerEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { PatternDataSchema, PatternOptionsSchema, type Key, type PatternEvent, type PatternOptions } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { sliderDefinition } from './definition'
import { getSliderRuntimeState, isMultiThumbSlider, type SliderPatternData } from './sliderRuntimeState'
import { usePatternElementId } from '../../adapters/reactDomIds'

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

export function useSliderPattern(data: SliderPatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSliderRuntime {
  const parsedData = PatternDataSchema.parse(data) as SliderPatternData
  const runtimeOptions = PatternOptionsSchema.parse(options ?? {})
  const keyToElementId = usePatternElementId(runtimeOptions, 'slider-')
  const runtime = createPatternRuntime({
    definition: sliderDefinition,
    data: parsedData,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const orientation = runtimeOptions.orientation === 'vertical' ? 'vertical' : 'horizontal'

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSliderRenderItem(runtime, key, orientation))
    },
    orientation,
    get isMultiThumb() {
      return isMultiThumbSlider(runtime)
    },
    get state() {
      return getSliderRuntimeState(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createSliderRenderItem(runtime: PatternRuntime<SliderPatternData>, key: Key, orientation: 'horizontal' | 'vertical'): ReactSliderRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('slider', key))
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
        runtime.emit(withDefaultReason({ type: 'focus', key }, 'keyboard'))
        dispatchReactKeyboardBinding(runtime, key, event)
      },
      onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
    },
    updateFromPointer: (event: PointerEvent<HTMLElement>) => {
      runtime.emit(withDefaultReason({ type: 'value', key, value: valueFromSliderPointer({ event, min, max, orientation, step }) }, 'pointer'))
    },
  }
}

function valueFromSliderPointer({
  event,
  min,
  max,
  orientation,
  step,
}: {
  event: PointerEvent<HTMLElement>
  min: number
  max: number
  orientation: 'horizontal' | 'vertical'
  step: number
}): number {
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = orientation === 'vertical'
    ? rect.height <= 0 ? 0 : Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height))
    : rect.width <= 0 ? 0 : Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const raw = min + ratio * (max - min)
  return Math.round(raw / step) * step
}
