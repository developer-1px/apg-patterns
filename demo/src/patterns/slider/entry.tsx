import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Slider } from './Slider'
import { reduceSliderData, sliderVariantItems, sliderVariants, type SliderVariantKey } from './sliderData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import type { PatternEvent } from '../../../../src'

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

export const entry = defineDemoPattern({
  definition: sliderDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<SliderVariantKey>(
      'color',
      sliderVariants.color.data,
      (variant) => sliderVariants[variant].data,
      (variant, data, event) => reduceSliderData(data, event, sliderVariants[variant].options),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data, options: sliderVariants[host.variant].options },
          model: { variantItems: sliderVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Slider },
      },
    }
  },
})
