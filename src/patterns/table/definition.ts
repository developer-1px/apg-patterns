import { PatternDefinitionSchema } from '../../schema'
import { tableParts } from './parts'

// Static (non-interactive) table per APG: role=table with rows containing
// columnheader / rowheader / cell. No focus/navigation — sortable lives in grid.

export const tableDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'table',
  rootRole: 'table',
  containedRoles: ['row', 'columnheader', 'rowheader', 'cell'],
  parts: tableParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
