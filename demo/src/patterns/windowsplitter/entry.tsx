import { WindowSplitter } from './WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from './windowsplitterData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const windowSplitterDemoDefinition = {
  key: 'windowsplitter',
  label: 'Window Splitter',
  keyboardShortcuts: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'],
  sources: {
    main: 'WindowSplitter.tsx',
    entry: 'windowsplitter/entry.tsx',
    hooks: ['windowsplitter/useWindowSplitterPattern.ts'],
    data: ['windowsplitterData.ts'],
    definition: 'windowsplitter/definition.ts',
    extra: ['windowsplitter/keyboard.ts', 'windowsplitter/parts.ts', 'windowsplitter/windowSplitterSeparatorProps.ts'],
  },
  view: {
    kind: 'component',
    component: 'WindowSplitter',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: windowSplitterDemoDefinition,
  initialData: initialWindowSplitterData,
  reduce: (data, event) => reduceWindowSplitterData(data, event, windowSplitterOptions),
  componentName: 'WindowSplitter',
  component: WindowSplitter,
  getStateValues: () => ({ options: windowSplitterOptions }),
})
