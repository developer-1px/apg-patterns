import { radioGroupDefinition, PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type RadioVariantKey = 'rovingTabindex' | 'ariaActiveDescendant' | 'rating'

const deliveryRadioData = PatternDataSchema.parse({
  items: {
    pickup: { label: 'Pickup' },
    courier: { label: 'Courier' },
    locker: { label: 'Locker' },
  },
  relations: {
    rootKeys: ['pickup', 'courier', 'locker'],
  },
  state: {
    activeKey: 'pickup',
    selectedKeys: ['pickup'],
  },
  refs: {
    label: 'Delivery method',
  },
})

const ratingRadioData = PatternDataSchema.parse({
  items: {
    star1: { label: '1 star' },
    star2: { label: '2 stars' },
    star3: { label: '3 stars' },
    star4: { label: '4 stars' },
    star5: { label: '5 stars' },
  },
  relations: {
    rootKeys: ['star1', 'star2', 'star3', 'star4', 'star5'],
  },
  state: {
    activeKey: 'star3',
    selectedKeys: ['star3'],
  },
  refs: {
    label: 'Rating',
  },
})

export const radioVariants: Record<RadioVariantKey, { label: string; data: PatternData; focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' }> = {
  rovingTabindex: { label: 'Roving tabindex', data: deliveryRadioData, focusStrategy: 'rovingTabIndex' },
  ariaActiveDescendant: { label: 'aria-activedescendant', data: deliveryRadioData, focusStrategy: 'ariaActiveDescendant' },
  rating: { label: 'Rating', data: ratingRadioData, focusStrategy: 'rovingTabIndex' },
}

export const radioVariantItems = variantItemsFrom(radioVariants)
export const initialRadioData = radioVariants.rovingTabindex.data

export function reduceRadioData(data: PatternData, event: PatternEvent): PatternData {
  const next = reducePatternData(radioGroupDefinition, data, event)
  if (event.type === 'navigate' && next.state?.activeKey) {
    return reducePatternData(radioGroupDefinition, next, { type: 'select', keys: [next.state.activeKey], anchorKey: next.state.activeKey, extentKey: next.state.activeKey })
  }
  return next
}
