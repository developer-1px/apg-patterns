import { reducePatternData } from '../../../../src'
import { dialogDefinition } from '../../../../src/patterns/dialog/definition'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Dialog } from './Dialog'
import { initialDialogData } from './dialogData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'dialog',
  label: 'Dialog',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialDialogData, (data, event) => reducePatternData(dialogDefinition, data, event))
    return {
      key: 'dialog',
      label: 'Dialog',
      keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape'],
      sourceNames: ['Dialog.tsx', 'dialogData.ts', 'dialog/useDialogPattern.ts', 'dialog/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Dialog data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
