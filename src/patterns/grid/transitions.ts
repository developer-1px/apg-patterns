import type { Transition } from '../../schema'

export const gridTransitions = [
  {
    on: 'editStart',
    actions: [
      { kind: 'set', field: 'editingKey', value: { from: '$event.key' } },
      { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.value' } },
    ],
  },
  {
    on: 'editDraft',
    actions: [
      { kind: 'setRecordValue', field: 'editDraftByKey', key: { from: '$event.key' }, value: { from: '$event.value' } },
    ],
  },
  {
    on: 'editEnd',
    actions: [{ kind: 'set', field: 'editingKey', value: { literal: null } }],
  },
] satisfies readonly Transition[]
