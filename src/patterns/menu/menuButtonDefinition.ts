import { PatternDefinitionSchema } from '../../schema'
import { menuButtonDefinitionKeyboard } from './menuButtonDefinitionKeyboard'
import { menuButtonEffects } from './menuButtonEffects'
import { menuButtonParts } from './menuButtonParts'
import './menuAriaSources'

export const menuButtonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menu-button',
  rootRole: 'button',
  containedRoles: ['menu', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: menuButtonEffects,
  parts: menuButtonParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: menuButtonDefinitionKeyboard,
})
