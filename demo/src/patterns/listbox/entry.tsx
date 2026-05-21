import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import {
  ListboxPreview,
  listboxDemoOptions,
  listboxPreviewData,
  listboxVariantItems,
  listboxVariants,
  reduceListboxDemoData,
  type ListboxVariantKey,
} from './listboxDemoRuntime'

const listboxDemoDefinition = {
  key: 'listbox',
  label: 'Listbox',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
  sources: {
    main: 'Listbox.tsx',
    entry: 'listbox/entry.tsx',
    data: ['RearrangeableListbox.tsx', 'listboxData.ts'],
    hooks: ['listbox/useListboxPattern.ts'],
    definition: 'listbox/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'listbox variants',
    idPrefix: 'listbox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'ListboxPreview',
    props: {
      variant: '$state.variant',
      data: '$state.data',
      options: '$state.options',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<ListboxVariantKey>({
  definition: listboxDemoDefinition,
  initialVariant: 'basic',
  initialData: listboxVariants.basic.data,
  dataByVariant: (variant) => listboxVariants[variant].data,
  reduce: (_variant, data, event) => reduceListboxDemoData(data, event),
  variantItems: listboxVariantItems,
  componentName: 'ListboxPreview',
  component: ListboxPreview,
  getStateValues: (variant, data) => ({
    data: listboxPreviewData(variant, data),
    options: listboxDemoOptions(variant),
  }),
})
