import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerGridAriaSources } from './ariaSources'
import { gridKeyboard } from './keyboard'
import { registerGridNavigation } from './navigation'
import { gridParts } from './parts'

registerGridAriaSources()
registerGridNavigation()

export const gridDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'grid',
  rootRole: 'grid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: gridParts,
  navigation: {
    visibleOrder: { kind: 'gridRows' },
    targets: {
      left: { kind: 'gridCell', action: 'left' },
      right: { kind: 'gridCell', action: 'right' },
      up: { kind: 'gridCell', action: 'up' },
      down: { kind: 'gridCell', action: 'down' },
      rowStart: { kind: 'gridCell', action: 'rowStart' },
      rowEnd: { kind: 'gridCell', action: 'rowEnd' },
      gridStart: { kind: 'gridCell', action: 'gridStart' },
      gridEnd: { kind: 'gridCell', action: 'gridEnd' },
      pageUp: { kind: 'gridPage', action: 'pageUp' },
      pageDown: { kind: 'gridPage', action: 'pageDown' },
    },
  },
  keyboard: gridKeyboard,
  transitions: [
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
  ],
})
