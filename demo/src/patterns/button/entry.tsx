import { Button } from './Button'
import { buttonVariantItems, buttonVariants, type ButtonVariantKey } from './buttonData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const buttonDemoDefinition = {
  key: 'button',
  label: 'Button',
  keyboardShortcuts: ['Enter', 'Space'],
  sources: {
    main: 'Button.tsx',
    entry: 'button/entry.tsx',
    data: ['buttonData.ts'],
    hooks: ['button/useButtonPattern.ts'],
    definition: 'button/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'button variants',
    idPrefix: 'button-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Button',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<ButtonVariantKey>({
  definition: buttonDemoDefinition,
  initialVariant: 'action',
  initialData: buttonVariants.action.data,
  dataByVariant: (variant) => buttonVariants[variant].data,
  reduce: (variant, data, event) => buttonVariants[variant].reduce(data, event),
  variantItems: buttonVariantItems,
  componentName: 'Button',
  component: Button,
})
