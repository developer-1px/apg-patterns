import { createElement, type ComponentPropsWithoutRef, type PointerEvent, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem } from '../../schema'
import type { ReactSliderRenderItem } from './sliderRenderItem'
import type { SliderData, SliderOptions } from './contract'
import { useSliderPattern } from './useSliderPattern'

type SliderDataItem = PatternItem & {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface SliderProps<TItem extends SliderDataItem = SliderDataItem> {
  data: SliderData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: SliderOptions
  className?: string
  renderSlider?: (item: ReactSliderRenderItem, dataItem: TItem) => ReactNode
}

export function Slider<TItem extends SliderDataItem = SliderDataItem>({ data, onEvent, options, className, renderSlider }: SliderProps<TItem>) {
  const slider = useSliderPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...slider.rootProps, className } as DivProps,
    slider.renderItems.map((item) =>
      createElement(
        'div',
        {
          key: item.key,
          ...item.sliderProps,
          onPointerDown: (event: PointerEvent<HTMLElement>) => item.updateFromPointer(event),
        } as DivProps & { key: Key },
        renderSlider?.(item, data.items[item.key]) ?? `${item.label} ${item.value}`,
      ),
    ),
  )
}
