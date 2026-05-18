import { reducePatternData } from '../../../../src'
import { dialogDefinition } from '../../../../src/patterns/dialog/definition'
import { Dialog } from './Dialog'
import { initialDialogData } from './dialogData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

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
  view: {
    kind: 'component',
    component: 'Dialog',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: dialogDemoDefinition,
  initialData: initialDialogData,
  reduce: (data, event) => reducePatternData(dialogDefinition, data, event),
  componentName: 'Dialog',
  component: Dialog,
})
