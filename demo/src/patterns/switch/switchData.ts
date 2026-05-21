import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { switchDefinition } from '../../../../src/patterns/switch/definition'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type SwitchVariantKey = 'switch' | 'button' | 'checkbox'

const switchData = PatternDataSchema.parse({
  items: {
    wifi: { label: 'Wi-Fi' },
  },
  relations: {
    rootKeys: ['wifi'],
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

export const switchVariantItems = variantItemsFrom(switchVariants)
export const initialSwitchData = switchVariants.switch.data

export function reduceSwitchData(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(switchDefinition, data, event)
}
