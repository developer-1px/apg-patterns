import { reducePatternData } from '../../kernel/patternReducer'
import type { PatternData, PatternDataWithOptions, PatternEvent } from '../../schema'
import { tabsDefinition } from './definition'

export function reduceTabsData(data: PatternDataWithOptions, event: PatternEvent): PatternData {
  const next = reducePatternData(tabsDefinition, data, event)
  const options = data.state?.options ?? {}
  const activeKey = next.state?.activeKey
  if (event.type === 'navigate' && options.activationMode === 'automatic' && activeKey) {
    return reducePatternData(tabsDefinition, next, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey })
  }
  return next
}
