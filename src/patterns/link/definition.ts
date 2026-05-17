import { PatternDefinitionSchema } from '../../schema'

export const LinkDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'link') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "link"' })
  if (value.rootRole !== 'link') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "link"' })
  if (!value.parts.link) ctx.addIssue({ code: 'custom', path: ['parts', 'link'], message: 'link requires parts.link' })
})

export const linkDefinition = LinkDefinitionSchema.parse({
  apgPattern: 'link',
  rootRole: 'link',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    link: {
      role: 'link',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'click', events: [{ type: 'activate', key: '$key' }] },
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
        { case: 'always', events: [{ type: 'activate', key: '$activeKey' }] },
      ],
    },
  ],
})
