import { reducePatternData } from '../../kernel/patternReducer'
import type { PatternData, PatternEvent } from '../../schema'
import { disclosureDefinition } from './definition'

export function reduceDisclosureData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(disclosureDefinition, data, event)
}
