import { Slider } from './Slider'
import { reduceSliderData, sliderVariantItems, sliderVariants, type SliderVariantKey } from './sliderData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const sliderDemoDefinition = {
  key: 'slider',
  label: 'Slider',
  keyboardShortcuts: ['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Shift+ArrowRight', 'Shift+ArrowUp', 'Shift+ArrowLeft', 'Shift+ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
  sources: {
    main: 'Slider.tsx',
    entry: 'slider/entry.tsx',
    hooks: ['slider/useSliderPattern.ts'],
    data: ['sliderData.ts'],
    definition: 'slider/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'slider variants',
    idPrefix: 'slider-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Slider',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<SliderVariantKey>({
  definition: sliderDemoDefinition,
  initialVariant: 'color',
  initialData: sliderVariants.color.data,
  dataByVariant: (variant) => sliderVariants[variant].data,
  reduce: (variant, data, event) => reduceSliderData(data, event, sliderVariants[variant].options),
  variantItems: sliderVariantItems,
  componentName: 'Slider',
  component: Slider,
  getStateValues: (variant) => ({ options: sliderVariants[variant].options }),
})
