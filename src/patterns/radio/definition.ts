import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { radioKeyboard } from './keyboard'
import { registerRadioNavigation } from './navigation'
import { radioParts } from './parts'
import { registerRadioStateSources } from './stateSources'

registerRadioNavigation()
registerRadioStateSources()

export const radioGroupDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'radio',
  rootRole: 'radiogroup',
  containedRoles: ['radio'],
  focusModel: 'rovingTabIndex',
  parts: radioParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'radioLinear', action: 'next' },
      previous: { kind: 'radioLinear', action: 'previous' },
      first: { kind: 'radioLinear', action: 'first' },
      last: { kind: 'radioLinear', action: 'last' },
    },
  },
  keyboard: radioKeyboard,
})
