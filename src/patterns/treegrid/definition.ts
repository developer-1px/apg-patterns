import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerTreegridAriaSources } from './ariaSources'
import { treegridKeyboard } from './keyboard'
import { registerTreegridNavigation } from './navigation'
import { treegridParts } from './parts'
import { registerTreegridPredicates } from './predicates'
import { registerTreegridRowNavigation } from './rowNavigation'

registerTreegridAriaSources()
registerTreegridNavigation()
registerTreegridPredicates()
registerTreegridRowNavigation()

export const treegridDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'treegrid',
  rootRole: 'treegrid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: treegridParts,
  navigation: {
    visibleOrder: { kind: 'treegridVisibleCells' },
    targets: {
      left: { kind: 'treegridCell', action: 'left' },
      right: { kind: 'treegridCell', action: 'right' },
      up: { kind: 'treegridCell', action: 'up' },
      down: { kind: 'treegridCell', action: 'down' },
      rowStart: { kind: 'treegridCell', action: 'rowStart' },
      rowEnd: { kind: 'treegridCell', action: 'rowEnd' },
      gridStart: { kind: 'treegridCell', action: 'gridStart' },
      gridEnd: { kind: 'treegridCell', action: 'gridEnd' },
      parentRow: { kind: 'treegridParentRowFirstCell' },
      pageDown: { kind: 'treegridPage', direction: 'down' },
      pageUp: { kind: 'treegridPage', direction: 'up' },
      rowUp: { kind: 'treegridRow', action: 'up' },
      rowDown: { kind: 'treegridRow', action: 'down' },
      rowGridStart: { kind: 'treegridRow', action: 'gridStart' },
      rowGridEnd: { kind: 'treegridRow', action: 'gridEnd' },
      rowPageDown: { kind: 'treegridRowPage', direction: 'down' },
      rowPageUp: { kind: 'treegridRowPage', direction: 'up' },
    },
  },
  keyboard: treegridKeyboard,
})
