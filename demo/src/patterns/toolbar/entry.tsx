import { Toolbar } from './Toolbar'
import { initialToolbarData, reduceToolbarData } from './toolbarData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const toolbarDemoDefinition = {
  key: 'toolbar',
  label: 'Toolbar',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Space'],
  sources: {
    main: 'Toolbar.tsx',
    entry: 'toolbar/entry.tsx',
    data: ['toolbarData.ts'],
    hooks: ['toolbar/useToolbarPattern.ts'],
    definition: 'toolbar/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Toolbar',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: toolbarDemoDefinition,
  initialData: initialToolbarData,
  reduce: reduceToolbarData,
  componentName: 'Toolbar',
  component: Toolbar,
})
