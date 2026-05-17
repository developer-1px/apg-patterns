import { reducePatternData } from '../../../../src'
import { AlertDialog } from './AlertDialog'
import { initialAlertDialogData } from './alertdialogData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { usePatternDataHost } from '../../shared/demoHostState'
import { alertDialogDefinition } from '../../../../src/patterns/alertdialog/definition'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'alertdialog',
  label: 'Alert Dialog',
  order: 13,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialAlertDialogData, (data, event) => reducePatternData(alertDialogDefinition, data, event))
    return {
      key: 'alertdialog',
      label: 'Alert Dialog',
      keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape', 'Enter', 'Space'],
      sourceNames: ['AlertDialog.tsx', 'alertdialogData.ts', 'alertdialog/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      preview: <AlertDialog data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
