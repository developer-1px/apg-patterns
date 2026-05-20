import { PatternDefinitionSchema } from '../../schema'
import { radioKeyboard } from './keyboard'
import { radioParts } from './parts'
import { registerRadioStateSources } from './stateSources'

registerRadioStateSources()

export const radioGroupDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'radio',
  rootRole: 'radiogroup',
  containedRoles: ['radio'],
  focusModel: 'rovingTabIndex',
  parts: radioParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: radioKeyboard,
})
