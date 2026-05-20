import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { buttonKeyboard } from './keyboard'
import { buttonParts } from './parts'

export const buttonDefinition: PatternDefinition = PatternDefinitionSchema.parse({
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
