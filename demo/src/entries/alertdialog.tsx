import { AlertDialog } from '../AlertDialog'
import { initialAlertDialogData } from '../alertdialogData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'alertdialog',
  label: 'Alert Dialog',
  order: 13,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'alertdialog',
      label: 'Alert Dialog',
      keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape', 'Enter', 'Space'],
      sourceNames: ['AlertDialog.tsx', 'alertdialogData.ts', 'alertdialog/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialAlertDialogData),
      preview: <AlertDialog />,
      reset: () => {},
    }
  },
}
