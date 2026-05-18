import { Tooltip } from './Tooltip'
import { initialTooltipData } from './tooltipData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

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
    extra: ['tooltip/tooltipTriggerProps.ts'],
  },
  view: {
    kind: 'component',
    component: 'Tooltip',
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: tooltipDemoDefinition,
  useRuntime: () => {
    return {
      inspect: renderDataInspect(initialTooltipData),
      context: {
        values: {},
        actions: {},
        components: {
          Tooltip,
        },
      },
    }
  },
})
