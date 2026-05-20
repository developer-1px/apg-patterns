import { reducePatternData } from '../../../../src/react'
import { AlertDialog } from './AlertDialog'
import { initialAlertDialogData } from './alertdialogData'
import { alertDialogDefinition } from '../../../../src/patterns/alertdialog/definition'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const alertDialogDemoDefinition = {
  key: 'alertdialog',
  label: 'Alert Dialog',
  keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape', 'Enter', 'Space'],
  sources: {
    main: 'AlertDialog.tsx',
    entry: 'alertdialog/entry.tsx',
    data: ['alertdialogData.ts'],
    hooks: ['alertdialog/useAlertDialogPattern.ts'],
    definition: 'alertdialog/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'AlertDialog',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: alertDialogDemoDefinition,
  initialData: initialAlertDialogData,
  reduce: (data, event) => reducePatternData(alertDialogDefinition, data, event),
  componentName: 'AlertDialog',
  component: AlertDialog,
})
