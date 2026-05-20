import { Meter } from './Meter'
import { meterVariantItems, meterVariants, type MeterVariantKey } from './meterData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const meterDemoDefinition = {
  key: 'meter',
  label: 'Meter',
  keyboardShortcuts: [],
  sources: {
    main: 'Meter.tsx',
    entry: 'meter/entry.tsx',
    data: ['meterData.ts'],
    hooks: ['meter/useMeterPattern.ts'],
    definition: 'meter/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'meter variants',
    idPrefix: 'meter-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Meter',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<MeterVariantKey>({
  definition: meterDemoDefinition,
  initialVariant: 'disk',
  initialData: meterVariants.disk.data,
  dataByVariant: (variant) => meterVariants[variant].data,
  reduce: (_variant, data) => data,
  variantItems: meterVariantItems,
  componentName: 'Meter',
  component: Meter,
  getStateValues: (variant) => ({ options: meterVariants[variant].options }),
})
