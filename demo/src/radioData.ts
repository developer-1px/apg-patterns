import { radioGroupDefinition, PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../src'

export const initialRadioData = PatternDataSchema.parse({
  items: {
    pickup: { label: 'Pickup' },
    courier: { label: 'Courier' },
    locker: { label: 'Locker' },
  },
  relations: {
    rootKeys: ['pickup', 'courier', 'locker'],
    childrenByKey: { pickup: [], courier: [], locker: [] },
  },
  state: {
    activeKey: 'pickup',
    selectedKeys: ['pickup'],
  },
  refs: {
    label: 'Delivery method',
  },
})

export function reduceRadioData(data: PatternData, event: PatternEvent): PatternData {
  const next = reducePatternData(radioGroupDefinition, data, event)
  if (event.type === 'navigate' && next.state?.activeKey) {
    return reducePatternData(radioGroupDefinition, next, { type: 'select', keys: [next.state.activeKey], anchorKey: next.state.activeKey, extentKey: next.state.activeKey })
  }
  return next
}
