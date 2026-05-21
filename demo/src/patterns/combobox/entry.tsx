import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariantItems, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const comboboxDemoDefinition = {
  key: 'combobox',
  label: 'Combobox',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'],
  sources: {
    main: 'Combobox.tsx',
    entry: 'combobox/entry.tsx',
    hooks: ['combobox/useComboboxPattern.ts'],
    data: ['comboboxData.ts'],
    definition: 'combobox/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'combobox variants',
    idPrefix: 'combobox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Combobox',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<ComboboxVariantKey>({
  definition: comboboxDemoDefinition,
  initialVariant: 'listAutocomplete',
  initialData: buildComboboxData(undefined, 'listAutocomplete'),
  dataByVariant: (variant) => buildComboboxData(undefined, variant),
  reduce: (_variant, data, event) => reduceComboboxData(data, event),
  variantItems: comboboxVariantItems,
  componentName: 'Combobox',
  component: Combobox,
})
