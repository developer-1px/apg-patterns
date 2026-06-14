import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerTreeviewNavigation } from '../treeview/navigation'
import { registerMenuAriaSources } from './menuAriaSources'
import { menubarKeyboard } from './menubarKeyboard'
import { registerMenubarNavigation } from './menubarNavigation'
import { menubarParts } from './menubarParts'

registerMenuAriaSources()
registerTreeviewNavigation()
registerMenubarNavigation()

export const menubarDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: menubarParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'menubarLinear', action: 'next' },
      previous: { kind: 'menubarLinear', action: 'previous' },
      first: { kind: 'menubarLinear', action: 'first' },
      last: { kind: 'menubarLinear', action: 'last' },
      down: { kind: 'menubarChild', position: 'first' },
    },
  },
  keyboard: menubarKeyboard,
})
