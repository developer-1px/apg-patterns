import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { switchKeyboard } from './keyboard'
import { switchParts } from './parts'

export const switchDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'switch',
  rootRole: 'switch',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: switchParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: switchKeyboard,
})
