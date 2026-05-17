import { Dialog } from '../Dialog'
import { initialDialogData } from '../dialogData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'dialog',
  label: 'Dialog',
  order: 17,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'dialog',
      label: 'Dialog',
      keyboardShortcuts: ['Tab', 'Shift+Tab', 'Escape'],
      sourceNames: ['Dialog.tsx', 'dialogData.ts', 'dialog/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialDialogData),
      preview: <Dialog />,
      reset: () => {},
    }
  },
}
