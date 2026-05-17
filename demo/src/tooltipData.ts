import type { PatternData } from '../../src'

export const tooltipTriggerId = 'tooltip-trigger'
export const tooltipPanelId = 'tooltip-panel'

export const initialTooltipData: PatternData = {
  items: {
    [tooltipTriggerId]: { label: 'Save' },
    [tooltipPanelId]: { label: 'Saves your changes' },
  },
  relations: {
    rootKeys: [tooltipTriggerId],
    controlsByKey: { [tooltipTriggerId]: [tooltipPanelId] },
    ownerByKey: { [tooltipPanelId]: tooltipTriggerId },
  },
  state: {
    expandedKeys: [],
    activeKey: tooltipTriggerId,
  },
}
