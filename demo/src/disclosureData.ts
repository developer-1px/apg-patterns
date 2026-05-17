import type { PatternData } from '../../src'

export const initialDisclosureData: PatternData = {
  items: {
    trigger: { label: 'Shipping details' },
    panel: { label: 'Shipping details panel' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['panel'] },
    ownerByKey: { panel: 'trigger' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
  },
}

export const disclosurePanelText =
  'Orders placed before 2pm ship the same business day. Tracking numbers are sent by email once your package leaves our warehouse.'
