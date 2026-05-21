import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { alertDialogKeyboard } from './keyboard'
import { alertDialogParts } from './parts'

export const alertDialogDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'alertdialog') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "alertdialog"' })
  if (value.rootRole !== 'alertdialog') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "alertdialog"' })
  if (!value.parts.dialog) ctx.addIssue({ code: 'custom', path: ['parts', 'dialog'], message: 'alertdialog requires parts.dialog' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'alertdialog requires parts.trigger' })
  if (!value.parts.confirm) ctx.addIssue({ code: 'custom', path: ['parts', 'confirm'], message: 'alertdialog requires parts.confirm' })
  if (!value.parts.cancel) ctx.addIssue({ code: 'custom', path: ['parts', 'cancel'], message: 'alertdialog requires parts.cancel' })
}).parse({
  apgPattern: 'alertdialog',
  rootRole: 'alertdialog',
  containedRoles: ['button'],
  focusModel: 'focusTrap',
  parts: alertDialogParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: alertDialogKeyboard,
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
  ] as const,
})
