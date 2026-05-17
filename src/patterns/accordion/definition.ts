import { PatternDefinitionSchema } from '../../schema'

export const AccordionDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'accordion') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "accordion"' })
  if (value.rootRole !== 'group') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "group"' })
  if (!value.parts.accordion) ctx.addIssue({ code: 'custom', path: ['parts', 'accordion'], message: 'accordion requires parts.accordion' })
  if (!value.parts.header) ctx.addIssue({ code: 'custom', path: ['parts', 'header'], message: 'accordion requires parts.header' })
  if (!value.parts.panel) ctx.addIssue({ code: 'custom', path: ['parts', 'panel'], message: 'accordion requires parts.panel' })
})

export const accordionDefinition = AccordionDefinitionSchema.parse({
  apgPattern: 'accordion',
  rootRole: 'group',
  containedRoles: ['button', 'region'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    accordion: {
      role: 'group',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      ],
    },
    header: {
      role: 'button',
      aria: [
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
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
        { name: 'expanded', from: 'state.expandedKeys' },
      ],
      events: [
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
        {
          event: 'click',
          when: { kind: 'isExpanded', key: '$key' },
          events: [{ type: 'expand', key: '$key', expanded: false }],
        },
        {
          event: 'click',
          when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
          events: [{ type: 'expand', key: '$key', expanded: true }],
        },
      ],
    },
    panel: {
      role: 'region',
      aria: [
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    {
      shortcut: 'Enter',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
        { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
      ],
    },
    {
      shortcut: 'Space',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
        { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
      ],
    },
  ],
})
