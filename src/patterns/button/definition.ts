import { PatternDefinitionSchema } from '../../schema'
import { buttonKeyboard } from './keyboard'
import { buttonParts } from './parts'

export const buttonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'button',
  rootRole: 'button',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: buttonParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: buttonKeyboard,
})
