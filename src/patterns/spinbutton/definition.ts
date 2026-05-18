import { PatternDefinitionSchema } from '../../schema'
import { spinbuttonKeyboard } from './keyboard'
import { spinbuttonParts } from './parts'

export const spinbuttonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'spinbutton',
  rootRole: 'spinbutton',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: spinbuttonParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: spinbuttonKeyboard,
})
