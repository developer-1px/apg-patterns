import { RadioGroup } from './RadioGroup'
import { initialRadioData, radioVariantItems, radioVariants, reduceRadioData, type RadioVariantKey } from './radioData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const radioDemoDefinition = {
  key: 'radio',
  label: 'Radio Group',
  keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
  sources: {
    main: 'RadioGroup.tsx',
    entry: 'radio/entry.tsx',
    data: ['radioData.ts'],
    hooks: ['radio/useRadioGroupPattern.ts'],
    definition: 'radio/definition.ts',
    extra: ['radio/keyboard.ts', 'radio/parts.ts', 'radio/radioRenderItem.ts', 'radio/stateSources.ts', 'radio/inspect.ts'],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'radio variants',
    idPrefix: 'radio-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'RadioGroup',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<RadioVariantKey>({
  definition: radioDemoDefinition,
  initialVariant: 'rovingTabindex',
  initialData: initialRadioData,
  dataByVariant: (variant) => radioVariants[variant].data,
  reduce: (_variant, data, event) => reduceRadioData(data, event),
  variantItems: radioVariantItems,
  componentName: 'RadioGroup',
  component: RadioGroup,
  getStateValues: (variant) => ({ options: { focusStrategy: radioVariants[variant].focusStrategy } }),
})
