import { Tooltip } from '../Tooltip'
import { initialTooltipData } from '../tooltipData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'tooltip',
  label: 'Tooltip',
  order: 25,
  useDemoPattern: (_onEvent) => {
    return {
      key: 'tooltip',
      label: 'Tooltip',
      keyboardShortcuts: ['Escape'],
      sourceNames: ['Tooltip.tsx', 'tooltipData.ts', 'tooltip/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(initialTooltipData),
      preview: <Tooltip />,
      reset: () => {},
    }
  },
}
