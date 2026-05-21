import type { PatternData } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type DialogVariantKey = 'dialog' | 'datepicker'

const addressDialogData: PatternData = {
  items: {
    trigger: { label: 'Add delivery address', kind: 'dialog' },
    dialog: { label: 'Add Delivery Address' },
    title: { label: 'Add Delivery Address' },
    description: { label: 'Provide a delivery address.' },
    cancel: { label: 'Cancel' },
    submit: { label: 'Add' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['dialog'], dialog: ['description'] },
    ownerByKey: { dialog: 'title' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
  },
}

const datepickerDialogData: PatternData = {
  items: {
    trigger: { label: 'Choose date', kind: 'dialog' },
    dialog: { label: 'Choose Date' },
    title: { label: 'Choose Date' },
    description: { label: 'Select a delivery date.' },
    cancel: { label: 'Cancel' },
    submit: { label: 'Choose' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['dialog'], dialog: ['description'] },
    ownerByKey: { dialog: 'title' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
  },
}

export const dialogVariants: Record<DialogVariantKey, { label: string; data: PatternData }> = {
  dialog: { label: 'Modal Dialog', data: addressDialogData },
  datepicker: { label: 'Date Picker Dialog', data: datepickerDialogData },
}

export const dialogVariantItems = variantItemsFrom(dialogVariants)
export const initialDialogData = dialogVariants.dialog.data

export const dialogFields = [
  { id: 'street', label: 'Street:' },
  { id: 'city', label: 'City:' },
  { id: 'state', label: 'State:' },
  { id: 'zip', label: 'Zip:' },
]
