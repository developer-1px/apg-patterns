import type { PatternData } from '../../src'

export const initialAlertDialogData: PatternData = {
  items: {
    trigger: { label: 'Discard draft', kind: 'dialog' },
    dialog: { label: 'Discard draft?', kind: 'true' },
    title: { label: 'Discard draft?' },
    description: { label: 'Your changes will be lost. This action cannot be undone.' },
    confirm: { label: 'Discard' },
    cancel: { label: 'Cancel' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: {
      trigger: ['dialog'],
      dialog: ['description'],
    },
    ownerByKey: {
      dialog: 'title',
    },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
  },
}
