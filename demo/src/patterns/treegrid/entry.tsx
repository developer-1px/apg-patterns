import { reducePatternData } from '../../../../src'
import { treegridDefinition } from '../../../../src/patterns/treegrid/definition'
import { Treegrid } from './Treegrid'
import { initialTreegridData } from './treegridData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const treegridDemoDefinition = {
  key: 'treegrid',
  label: 'Treegrid',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'],
  sources: {
    main: 'Treegrid.tsx',
    entry: 'treegrid/entry.tsx',
    hooks: ['treegrid/useTreegridPattern.ts'],
    data: ['treegridData.ts'],
    definition: 'treegrid/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Treegrid',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: treegridDemoDefinition,
  initialData: initialTreegridData,
  reduce: (data, event) => reducePatternData(treegridDefinition, data, event),
  componentName: 'Treegrid',
  component: Treegrid,
})
