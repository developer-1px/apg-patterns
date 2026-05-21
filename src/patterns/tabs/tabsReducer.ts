import { reducePatternData } from '../../kernel/patternReducer'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { tabsDefinition } from './definition'

export function reduceTabsData(data: PatternData, event: PatternEvent, options: PatternOptions = {}): PatternData {
  const next = reducePatternData(tabsDefinition, data, event)
  const activeKey = next.state?.activeKey
  if (event.type === 'navigate' && options.activationMode === 'automatic' && activeKey) {
    return reducePatternData(tabsDefinition, next, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey })
  }
  return next
}
