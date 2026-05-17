import { useVariantPatternDataHost } from '../demoHostState'
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
    const host = useVariantPatternDataHost<SliderVariantKey>(
      'color',
      sliderVariants.color.data,
      (variant) => sliderVariants[variant].data,
      (variant, data, event) => reduceSliderData(data, event, sliderVariants[variant].options),
    )
    const options = sliderVariants[host.variant].options
    return {
      key: 'slider',
      label: 'Slider',
      keyboardShortcuts: ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Shift+ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
      sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderSliderInspect(host.data),
      variants: <VariantListbox value={host.variant} items={sliderVariantItems} label="slider variants" idPrefix="slider-variant" onChange={host.selectVariant} />,
      preview: <Slider data={host.data} options={options} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
