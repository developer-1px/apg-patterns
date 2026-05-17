import { PatternDefinitionSchema } from '../../schema'

export const DisclosureDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'disclosure') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "disclosure"' })
  if (value.rootRole !== 'button') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "button"' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'disclosure requires parts.trigger' })
  if (!value.parts.panel) ctx.addIssue({ code: 'custom', path: ['parts', 'panel'], message: 'disclosure requires parts.panel' })
})

export const disclosureDefinition = DisclosureDefinitionSchema.parse({
  apgPattern: 'disclosure',
  rootRole: 'button',
  containedRoles: ['region'],
  focusModel: 'rovingTabIndex',
  parts: {
    trigger: {
      role: 'button',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
        { attribute: 'aria-label', from: 'items.label' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'expanded', from: 'state.expandedKeys' },
      ],
      events: [
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
      keySource: 'items',
      aria: [
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
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

export const serializableDisclosureDefinition = JSON.parse(
  JSON.stringify(disclosureDefinition),
) as typeof disclosureDefinition
