import { PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { buttonDefinition } from '../../../../src/patterns/button/definition'

export type ButtonVariantKey = 'action' | 'toggle'

export interface ButtonVariant {
  key: ButtonVariantKey
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
  // Action button has no toggle state — drop `press` events so aria-pressed never appears.
  if (event.type === 'press') return data
  return reducePatternData(buttonDefinition, data, event)
}

function reduceToggle(data: PatternData, event: PatternEvent): PatternData {
  return reducePatternData(buttonDefinition, data, event)
}

export const buttonVariants: Record<ButtonVariantKey, ButtonVariant> = {
  action: {
    key: 'action',
    label: 'Action',
    data: actionInitial,
    reduce: reduceAction,
  },
  toggle: {
    key: 'toggle',
    label: 'Toggle (aria-pressed)',
    data: toggleInitial,
    reduce: reduceToggle,
  },
}

export const buttonVariantItems: readonly { key: ButtonVariantKey; label: string }[] = [
  { key: 'action', label: 'Action' },
  { key: 'toggle', label: 'Toggle (aria-pressed)' },
]

export const initialButtonData = actionInitial
export function reduceButtonData(data: PatternData, event: PatternEvent): PatternData {
  return reduceAction(data, event)
}
