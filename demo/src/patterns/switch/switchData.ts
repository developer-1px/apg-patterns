import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { switchDefinition } from '../../../../src/patterns/switch/definition'

export type SwitchVariantKey = 'switch' | 'button' | 'checkbox'

const switchData = PatternDataSchema.parse({
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

export const switchVariants: Record<SwitchVariantKey, { label: string; data: PatternData }> = {
  switch: { label: 'Switch role', data: switchData },
  button: { label: 'Button element', data: switchData },
  checkbox: { label: 'Checkbox input', data: switchData },
}

export const switchVariantItems = Object.entries(switchVariants).map(([key, value]) => ({ key: key as SwitchVariantKey, label: value.label }))
export const initialSwitchData = switchVariants.switch.data

export function reduceSwitchData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(switchDefinition, data, event)
}
