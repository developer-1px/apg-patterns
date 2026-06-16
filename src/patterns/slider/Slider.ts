import type { PointerEvent, ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useSliderPattern, type ReactSliderRenderItem } from './useSliderPattern'

type SliderDataItem = PatternItem & {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}

export interface SliderProps<TItem extends SliderDataItem = SliderDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSlider?: (item: ReactSliderRenderItem, dataItem: TItem) => ReactNode
}

export function Slider<TItem extends SliderDataItem = SliderDataItem>({ data, onEvent, options, className, renderSlider }: SliderProps<TItem>) {
  const slider = useSliderPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: slider.rootProps, className, items: slider.renderItems, dataItems: data.items,
    getItemProps: (item) => ({
      ...item.sliderProps,
      onPointerDown: (event: PointerEvent<HTMLElement>) => item.updateFromPointer(event),
    }),
    children: (item, dataItem) => renderSlider?.(item, dataItem) ?? `${item.label} ${item.value}`,
  })
}
