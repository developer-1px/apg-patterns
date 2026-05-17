import { PatternDefinitionSchema } from '../../schema'

export const AlertDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'alert') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "alert"' })
  if (value.rootRole !== 'alert') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "alert"' })
  if (!value.parts.alert) ctx.addIssue({ code: 'custom', path: ['parts', 'alert'], message: 'alert requires parts.alert' })
})

// APG Alert pattern.
//   - role="alert" implies aria-live="assertive" and aria-atomic="true".
//   - No focus management; no keyboard interaction on the alert itself.
//   - Optional dismiss button: Escape or click → emits dismiss / expand:false.
// State model: an alert key is "visible" iff it is present in state.expandedKeys.
export const alertDefinition = AlertDefinitionSchema.parse({
  apgPattern: 'alert',
  rootRole: 'alert',
  containedRoles: [],
  parts: {
    alert: {
      role: 'alert',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
      ],
      state: [
        { name: 'expanded', from: 'state.expandedKeys' },
      ],
    },
    dismiss: {
      role: 'button',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      ],
      events: [
        {
          event: 'click',
          events: [{ type: 'dismiss', key: '$activeKey' }],
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
      shortcut: 'Escape',
      preventDefault: true,
      cases: [
        { case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] },
      ],
    },
  ],
})

export const serializableAlertDefinition = JSON.parse(
  JSON.stringify(alertDefinition),
) as typeof alertDefinition
