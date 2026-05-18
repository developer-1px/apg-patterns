import { reducePatternData } from '../../../../src'
import { dialogDefinition } from '../../../../src/patterns/dialog/definition'
import { Dialog } from './Dialog'
import { dialogVariantItems, dialogVariants, initialDialogData, type DialogVariantKey } from './dialogData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const dialogDemoDefinition = {
  key: 'dialog',
  label: 'Dialog',
  keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape'],
  sources: {
    main: 'Dialog.tsx',
    entry: 'dialog/entry.tsx',
    data: ['dialogData.ts'],
    hooks: ['dialog/useDialogPattern.ts'],
    definition: 'dialog/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'dialog variants',
    idPrefix: 'dialog-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Dialog',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<DialogVariantKey>({
  definition: dialogDemoDefinition,
  initialVariant: 'dialog',
  initialData: initialDialogData,
  dataByVariant: (variant) => dialogVariants[variant].data,
  reduce: (_variant, data, event) => reducePatternData(dialogDefinition, data, event),
  variantItems: dialogVariantItems,
  componentName: 'Dialog',
  component: Dialog,
})
