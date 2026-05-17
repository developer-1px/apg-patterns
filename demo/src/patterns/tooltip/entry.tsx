import { Tooltip } from './Tooltip'
import { initialTooltipData } from './tooltipData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'tooltip',
  label: 'Tooltip',
  useDemoPattern: (_onEvent) => {
    return {
      key: 'tooltip',
      label: 'Tooltip',
      keyboardShortcuts: ['Escape'],
      sourceNames: ['Tooltip.tsx', 'tooltipData.ts', 'tooltip/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(initialTooltipData),
      preview: <Tooltip />,
    }
  },
}
