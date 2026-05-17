import { useState } from 'react'
import { renderSliderInspect } from '../inspect'
import { Slider } from '../Slider'
import { reduceSliderData, sliderVariantItems, sliderVariants, type SliderVariantKey } from '../sliderData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'slider',
  label: 'Slider',
  order: 5,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<SliderVariantKey>('color')
    const [data, setData] = useState(sliderVariants.color.data)
    const options = sliderVariants[variant].options
    return {
      key: 'slider',
      label: 'Slider',
      keyboardShortcuts: ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Shift+ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
      sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderSliderInspect(data),
      variants: <VariantListbox value={variant} items={sliderVariantItems} label="slider variants" idPrefix="slider-variant" onChange={(next) => {
        setVariant(next)
        setData(sliderVariants[next].data)
      }} />,
      preview: <Slider data={data} options={options} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceSliderData(current, event, options))
      }} />,
      reset: () => setData(sliderVariants[variant].data),
    }
  },
}
