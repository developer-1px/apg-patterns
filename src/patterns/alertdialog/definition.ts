import { PatternDefinitionSchema } from '../../schema'

export const AlertDialogDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'alertdialog') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "alertdialog"' })
  if (value.rootRole !== 'alertdialog') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "alertdialog"' })
  if (!value.parts.dialog) ctx.addIssue({ code: 'custom', path: ['parts', 'dialog'], message: 'alertdialog requires parts.dialog' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'alertdialog requires parts.trigger' })
  if (!value.parts.confirm) ctx.addIssue({ code: 'custom', path: ['parts', 'confirm'], message: 'alertdialog requires parts.confirm' })
  if (!value.parts.cancel) ctx.addIssue({ code: 'custom', path: ['parts', 'cancel'], message: 'alertdialog requires parts.cancel' })
})

export const alertDialogDefinition = AlertDialogDefinitionSchema.parse({
  apgPattern: 'alertdialog',
  rootRole: 'alertdialog',
  containedRoles: ['button'],
  focusModel: 'focusTrap',
  parts: {
    trigger: {
      role: 'button',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
        { attribute: 'aria-haspopup', from: 'items.kind' },
      ],
      events: [
        {
          event: 'click',
          when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
          events: [{ type: 'expand', key: '$key', expanded: true }],
        },
      ],
    },
    dialog: {
      role: 'alertdialog',
      keySource: 'items',
      aria: [
        { attribute: 'aria-modal', from: 'items.kind' },
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
        { attribute: 'aria-describedby', from: 'relations.controlsByKey' },
      ],
    },
    confirm: {
      role: 'button',
      keySource: 'items',
      events: [
        {
          event: 'click',
          events: [{ type: 'expand', key: '$triggerKey', expanded: false }],
        },
      ],
    },
    cancel: {
      role: 'button',
      keySource: 'items',
      events: [
        {
          event: 'click',
          events: [{ type: 'expand', key: '$triggerKey', expanded: false }],
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
        { case: 'always', events: [{ type: 'expand', key: '$triggerKey', expanded: false }] },
      ],
    },
  ],
  transitions: [
    {
      on: 'expand',
      actions: [
        { kind: 'set', field: 'activeKey', value: { from: '$event.key' } },
        {
          kind: 'setMembership',
          field: 'expandedKeys',
          value: { from: '$event.key' },
          present: { from: '$event.expanded' },
        },
      ],
    },
  ],
  effects: [
    {
      kind: 'focus',
      when: { kind: 'isExpanded', key: '$triggerKey' },
      target: { kind: 'key', key: '$initialFocusKey' },
      preventScroll: true,
    },
    {
      kind: 'restoreFocus',
      when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$triggerKey' } },
      target: { kind: 'key', key: '$triggerKey' },
      preventScroll: true,
    },
    {
      kind: 'trapFocus',
      when: { kind: 'isExpanded', key: '$triggerKey' },
      root: { kind: 'controlledBy', key: '$triggerKey' },
    },
  ],
})

export const serializableAlertDialogDefinition = JSON.parse(
  JSON.stringify(alertDialogDefinition),
) as typeof alertDialogDefinition
