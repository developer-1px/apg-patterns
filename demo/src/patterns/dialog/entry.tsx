import { Dialog } from './Dialog'
import { initialDialogData } from './dialogData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'dialog',
  label: 'Dialog',
  useDemoPattern: (_onEvent) => {
    return {
      key: 'dialog',
      label: 'Dialog',
      keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape'],
      sourceNames: ['Dialog.tsx', 'dialogData.ts', 'dialog/useDialogPattern.ts', 'dialog/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(initialDialogData),
      preview: <Dialog />,
    }
  },
}
