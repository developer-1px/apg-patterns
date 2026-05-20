import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { sliderKeyboard } from './keyboard'
import { sliderParts } from './parts'

export const sliderDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'slider',
  rootRole: 'slider',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: sliderParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: sliderKeyboard,
})
