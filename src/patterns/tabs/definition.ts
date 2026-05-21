import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { tabsEffects } from './effects'
import { tabsKeyboard } from './keyboard'
import { registerTabsNavigation } from './navigation'
import { tabsParts } from './parts'

registerTabsNavigation()

export const tabsDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  const containedRoles = value.containedRoles ?? []
  if (value.apgPattern !== 'tabs') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "tabs"' })
  if (value.rootRole !== 'tablist') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "tablist"' })
  if (containedRoles.length !== 2 || containedRoles[0] !== 'tab' || containedRoles[1] !== 'tabpanel') {
    ctx.addIssue({ code: 'custom', path: ['containedRoles'], message: 'expected ["tab", "tabpanel"]' })
  }
  if (!value.parts.tablist) ctx.addIssue({ code: 'custom', path: ['parts', 'tablist'], message: 'tabs requires parts.tablist' })
  if (!value.parts.tab) ctx.addIssue({ code: 'custom', path: ['parts', 'tab'], message: 'tabs requires parts.tab' })
  if (!value.parts.tabpanel) ctx.addIssue({ code: 'custom', path: ['parts', 'tabpanel'], message: 'tabs requires parts.tabpanel' })
}).parse({
  apgPattern: 'tabs',
  rootRole: 'tablist',
  containedRoles: ['tab', 'tabpanel'],
  focusModel: 'rovingTabIndex',
  effects: tabsEffects,
  parts: tabsParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'tabsLinear', action: 'next' },
      previous: { kind: 'tabsLinear', action: 'previous' },
      first: { kind: 'tabsLinear', action: 'first' },
      last: { kind: 'tabsLinear', action: 'last' },
    },
  },
  keyboard: tabsKeyboard,
})
