import { definePredicate, resolveKeyToken } from '../../kernel/patternKernel'
import { PatternDefinitionSchema } from '../../schema'

definePredicate('isPressed', (predicate, ctx) => {
  if (predicate.kind !== 'extension' || predicate.name !== 'isPressed') return false
  const key = resolveKeyToken(predicate.key ?? '$key', ctx.key, ctx.activeKey)
  return ctx.data.state?.pressedByKey?.[key] === true
})

export const buttonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'button',
  rootRole: 'button',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    button: {
      role: 'button',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-pressed', from: 'state.pressedByKey' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      state: [
        { name: 'pressed', from: 'state.pressedByKey' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        {
          event: 'click',
          when: { kind: 'extension', name: 'isPressed', key: '$key' },
          events: [{ type: 'press', key: '$key', pressed: false }, { type: 'activate', key: '$key' }],
        },
        {
          event: 'click',
          when: { kind: 'not', predicate: { kind: 'extension', name: 'isPressed', key: '$key' } },
          events: [{ type: 'press', key: '$key', pressed: true }, { type: 'activate', key: '$key' }],
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
      shortcut: 'Enter',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'extension', name: 'isPressed', key: '$activeKey' }, events: [{ type: 'press', key: '$activeKey', pressed: false }, { type: 'activate', key: '$activeKey' }] },
        { case: 'otherwise', events: [{ type: 'press', key: '$activeKey', pressed: true }, { type: 'activate', key: '$activeKey' }] },
      ],
    },
    {
      shortcut: 'Space',
      preventDefault: true,
      cases: [
        { case: 'when', when: { kind: 'extension', name: 'isPressed', key: '$activeKey' }, events: [{ type: 'press', key: '$activeKey', pressed: false }, { type: 'activate', key: '$activeKey' }] },
        { case: 'otherwise', events: [{ type: 'press', key: '$activeKey', pressed: true }, { type: 'activate', key: '$activeKey' }] },
      ],
    },
  ],
})
