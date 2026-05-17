import type { PatternData } from '../../../../src'

export const initialDialogData: PatternData = {
  items: {
    trigger: { label: 'Add delivery address' },
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
