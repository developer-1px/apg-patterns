import { PatternDefinitionSchema } from '../../schema'
import { treegridEffects } from './effects'
import { treegridKeyboard } from './keyboard'
import { treegridParts } from './parts'
import './ariaSources'
import './navigation'

export { treegridVisibleRowKeys, treegridVisibleCells } from './navigation'

export const treegridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'treegrid',
  rootRole: 'treegrid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  effects: treegridEffects,
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
