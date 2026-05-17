import { checkboxDefinition, PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../src'

export const initialCheckboxData = PatternDataSchema.parse({
  items: {
    updates: { label: 'Email updates' },
  },
  relations: {
    rootKeys: ['updates'],
    childrenByKey: { updates: [] },
  },
  state: {
    activeKey: 'updates',
    checkedByKey: { updates: false },
  },
})

export function reduceCheckboxData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(checkboxDefinition, data, event)
}
