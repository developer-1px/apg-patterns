import { PatternDefinitionSchema } from '../../schema'
import { tabsKeyboard } from './keyboard'
import './navigation'

// flatTabs 별칭은 제거 — kernel 의 'flat' 을 재사용한다 (P1 fragmentation 통합).

export const TabsDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  const containedRoles = value.containedRoles ?? []
  if (value.apgPattern !== 'tabs') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "tabs"' })
  if (value.rootRole !== 'tablist') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "tablist"' })
  if (containedRoles.length !== 2 || containedRoles[0] !== 'tab' || containedRoles[1] !== 'tabpanel') {
    ctx.addIssue({ code: 'custom', path: ['containedRoles'], message: 'expected ["tab", "tabpanel"]' })
  }
  if (!value.parts.tablist) ctx.addIssue({ code: 'custom', path: ['parts', 'tablist'], message: 'tabs requires parts.tablist' })
  if (!value.parts.tab) ctx.addIssue({ code: 'custom', path: ['parts', 'tab'], message: 'tabs requires parts.tab' })
  if (!value.parts.tabpanel) ctx.addIssue({ code: 'custom', path: ['parts', 'tabpanel'], message: 'tabs requires parts.tabpanel' })
})

export const tabsDefinition = TabsDefinitionSchema.parse({
  apgPattern: 'tabs',
  rootRole: 'tablist',
  containedRoles: ['tab', 'tabpanel'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    tablist: {
      role: 'tablist',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
      ],
    },
    tab: {
      role: 'tab',
      aria: [
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'always' },
          active: 0,
          inactive: -1,
        },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
      ],
      events: [
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', events: [{ type: 'select', key: '$key' }] },
        { event: 'focus', when: { kind: 'optionEquals', option: 'activationMode', value: 'automatic' }, events: [{ type: 'select', key: '$key' }] },
      ],
    },
    tabpanel: {
      role: 'tabpanel',
      aria: [{ attribute: 'aria-labelledby', from: 'relations.ownerByKey' }],
      focus: {
        tabIndex: {
          when: { kind: 'always' },
          value: 0,
        },
      },
    },
  },
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
