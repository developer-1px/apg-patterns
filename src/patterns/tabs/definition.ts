import { moveLinear } from '@interactive-os/collection-navigation'
import { PatternDefinitionSchema } from '../../schema'
import { defineNavigationTarget } from '../../patternKernel'

// flatTabs 별칭은 제거 — kernel 의 'flat' 을 재사용한다 (P1 fragmentation 통합).

defineNavigationTarget('tabsLinear', (target, ctx) => {
  const action = target.action as 'next' | 'previous' | 'first' | 'last'
  if (action === 'next') return moveLinear(ctx.visibleKeys, ctx.activeKey, 'next') ?? ctx.visibleKeys[0] ?? null
  if (action === 'previous') return moveLinear(ctx.visibleKeys, ctx.activeKey, 'previous') ?? ctx.visibleKeys[ctx.visibleKeys.length - 1] ?? null
  return moveLinear(ctx.visibleKeys, ctx.activeKey, action)
})

export const TabsPatternDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
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

export const tabsPatternDefinition = TabsPatternDefinitionSchema.parse({
  apgPattern: 'tabs',
  rootRole: 'tablist',
  containedRoles: ['tab', 'tabpanel'],
  focusModel: 'rovingTabIndex',
  parts: {
    tablist: {
      role: 'tablist',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
      ],
    },
    tab: {
      role: 'tab',
      keySource: 'collectionItemKey',
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
      keySource: 'controlledPanelKey',
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
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
  ],
})

export const serializableTabsPatternDefinition = JSON.parse(
  JSON.stringify(tabsPatternDefinition),
) as typeof tabsPatternDefinition
