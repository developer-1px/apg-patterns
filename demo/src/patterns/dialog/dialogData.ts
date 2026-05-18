import type { PatternData } from '../../../../src'

export type DialogVariantKey = 'dialog' | 'datepicker'

const addressDialogData: PatternData = {
  items: {
    trigger: { label: 'Add delivery address', kind: 'dialog' },
    dialog: { label: 'Add Delivery Address' },
    title: { label: 'Add Delivery Address' },
    description: { label: 'Provide an address where you would like your order delivered.' },
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
    description: { label: 'Select an available delivery date.' },
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

export const dialogVariantItems = Object.entries(dialogVariants).map(([key, value]) => ({ key: key as DialogVariantKey, label: value.label }))
export const initialDialogData = dialogVariants.dialog.data

export const dialogContent = {
  triggerLabel: 'Add delivery address',
  title: 'Add Delivery Address',
  description:
    'Please provide an address where you would like your order delivered. All fields are required.',
  fields: [
    { id: 'street', label: 'Street:' },
    { id: 'city', label: 'City:' },
    { id: 'state', label: 'State:' },
    { id: 'zip', label: 'Zip:' },
  ],
  cancelLabel: 'Cancel',
  submitLabel: 'Add',
}
