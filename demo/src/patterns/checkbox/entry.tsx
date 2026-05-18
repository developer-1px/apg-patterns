import { Checkbox } from './Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from './checkboxData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const checkboxDemoDefinition = {
  key: 'checkbox',
  label: 'Checkbox',
  keyboardShortcuts: ['Space'],
  sources: {
    main: 'Checkbox.tsx',
    entry: 'checkbox/entry.tsx',
    data: ['checkboxData.ts'],
    hooks: ['checkbox/useCheckboxPattern.ts'],
    definition: 'checkbox/definition.ts',
    extra: ['checkbox/inspect.ts'],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'checkbox variants',
    idPrefix: 'checkbox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Checkbox',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<CheckboxVariantKey>({
  definition: checkboxDemoDefinition,
  initialVariant: 'twoState',
  initialData: checkboxVariants.twoState.data,
  dataByVariant: (variant) => checkboxVariants[variant].data,
  reduce: (variant, data, event) => checkboxVariants[variant].reduce(data, event),
  variantItems: checkboxVariantItems,
  componentName: 'Checkbox',
  component: Checkbox,
})
