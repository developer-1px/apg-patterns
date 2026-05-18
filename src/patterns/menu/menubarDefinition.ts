import { PatternDefinitionSchema } from '../../schema'
import { menubarEffects } from './menubarEffects'
import { menubarKeyboard } from './menubarKeyboard'
import { menubarParts } from './menubarParts'
import './menuAriaSources'

export const menubarDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: menubarEffects,
  parts: menubarParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
      down: { kind: 'firstChild' },
    },
  },
  keyboard: menubarKeyboard,
})
