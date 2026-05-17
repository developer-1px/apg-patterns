import { PatternDefinitionSchema } from '../../schema'

export const switchDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'switch',
  rootRole: 'switch',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    switch: {
      role: 'switch',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      state: [
        { name: 'checked', from: 'state.checkedByKey' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        {
          event: 'click',
          when: { kind: 'isSwitchOn', key: '$key' },
          events: [{ type: 'check', key: '$key', checked: false }],
        },
        {
          event: 'click',
          when: { kind: 'not', predicate: { kind: 'isSwitchOn', key: '$key' } },
          events: [{ type: 'check', key: '$key', checked: true }],
        },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
    {
      shortcut: 'Space',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'isSwitchOn', key: '$activeKey' }, events: [{ type: 'check', key: '$activeKey', checked: false }] },
        { case: 'otherwise', events: [{ type: 'check', key: '$activeKey', checked: true }] },
      ],
    },
    {
      shortcut: 'Enter',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'isSwitchOn', key: '$activeKey' }, events: [{ type: 'check', key: '$activeKey', checked: false }] },
        { case: 'otherwise', events: [{ type: 'check', key: '$activeKey', checked: true }] },
      ],
    },
  ],
})
