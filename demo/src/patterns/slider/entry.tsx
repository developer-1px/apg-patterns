import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Slider } from './Slider'
import { reduceSliderData, sliderVariantItems, sliderVariants, type SliderVariantKey } from './sliderData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'

export const entry: PatternEntry = {
  key: 'slider',
  label: 'Slider',
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<SliderVariantKey>(
      'color',
      sliderVariants.color.data,
      (variant) => sliderVariants[variant].data,
      (variant, data, event) => reduceSliderData(data, event, sliderVariants[variant].options),
    )
    return {
      key: 'slider',
      label: 'Slider',
      keyboardShortcuts: ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Shift+ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
      sourceNames: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox orientation="horizontal" value={host.variant} items={sliderVariantItems} label="slider variants" idPrefix="slider-variant" onChange={host.selectVariant} />,
      preview: <Slider data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
