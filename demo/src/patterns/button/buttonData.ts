import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { buttonDefinition } from '../../../../src/patterns/button/definition'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type ButtonVariantKey = 'action' | 'toggle'

interface ButtonVariant {
  label: string
  data: PatternData
  reduce: (data: PatternData, event: PatternEvent) => PatternData
}

const actionInitial = PatternDataSchema.parse({
  items: {
    save: { label: 'Save' },
  },
  relations: {
    rootKeys: ['save'],
  },
  state: {
    activeKey: 'save',
  },
})

const toggleInitial = PatternDataSchema.parse({
  items: {
    mute: { label: 'Mute' },
  },
  relations: {
    rootKeys: ['mute'],
  },
  state: {
    activeKey: 'mute',
    pressedByKey: { mute: false },
  },
})

function reduceAction(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'press') return data
  return reducePatternData(buttonDefinition, data, event)
}

export const buttonVariants: Record<ButtonVariantKey, ButtonVariant> = {
  action: {
    label: 'Action',
    data: actionInitial,
    reduce: reduceAction,
  },
  toggle: {
    label: 'Toggle (aria-pressed)',
    data: toggleInitial,
    reduce: (data, event) => reducePatternData(buttonDefinition, data, event),
  },
}

export const buttonVariantItems = variantItemsFrom(buttonVariants)
