import { Tooltip } from './Tooltip'
import { initialTooltipData } from './tooltipData'
import { reducePatternData } from '../../../../src'
import { tooltipDefinition } from '../../../../src/patterns/tooltip/definition'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const tooltipDemoDefinition = {
  key: 'tooltip',
  label: 'Tooltip',
  keyboardShortcuts: ['Escape'],
  sources: {
    main: 'Tooltip.tsx',
    entry: 'tooltip/entry.tsx',
    data: ['tooltipData.ts'],
    hooks: ['tooltip/useTooltipPattern.ts'],
    definition: 'tooltip/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Tooltip',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: tooltipDemoDefinition,
  initialData: initialTooltipData,
  reduce: (data, event) => reducePatternData(tooltipDefinition, data, event),
  componentName: 'Tooltip',
  component: Tooltip,
})
