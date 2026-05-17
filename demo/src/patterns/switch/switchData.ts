import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { switchDefinition } from '../../../../src/patterns/switch/definition'

export const initialSwitchData = PatternDataSchema.parse({
  items: {
    wifi: { label: 'Wi-Fi' },
  },
  relations: {
    rootKeys: ['wifi'],
    childrenByKey: { wifi: [] },
  },
  state: {
    activeKey: 'wifi',
    checkedByKey: { wifi: false },
  },
})

export function reduceSwitchData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(switchDefinition, data, event)
}
