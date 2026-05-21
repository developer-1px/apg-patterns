import { Spinbutton } from './Spinbutton'
import { reduceSpinbuttonData, spinbuttonVariantItems, spinbuttonVariants, type SpinbuttonVariantKey } from './spinbuttonData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const spinbuttonDemoDefinition = {
  key: 'spinbutton',
  label: 'Spinbutton',
  keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
  sources: {
    main: 'Spinbutton.tsx',
    entry: 'spinbutton/entry.tsx',
    hooks: ['spinbutton/useSpinbuttonPattern.ts'],
    data: ['spinbuttonData.ts'],
    definition: 'spinbutton/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'spinbutton variants',
    idPrefix: 'spinbutton-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Spinbutton',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<SpinbuttonVariantKey>({
  definition: spinbuttonDemoDefinition,
  initialVariant: 'numeric',
  initialData: spinbuttonVariants.numeric.data,
  dataByVariant: (variant) => spinbuttonVariants[variant].data,
  reduce: (variant, data, event) => reduceSpinbuttonData(data, event, spinbuttonVariants[variant].options),
  variantItems: spinbuttonVariantItems,
  componentName: 'Spinbutton',
  component: Spinbutton,
  getStateValues: (variant) => ({ options: spinbuttonVariants[variant].options }),
})
