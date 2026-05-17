import { PatternDefinitionSchema } from '../../schema'

export const DialogDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'dialog') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "dialog"' })
  if (value.rootRole !== 'dialog') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "dialog"' })
  if (!value.parts.dialog) ctx.addIssue({ code: 'custom', path: ['parts', 'dialog'], message: 'dialog requires parts.dialog' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'dialog requires parts.trigger' })
})

export const dialogDefinition = DialogDefinitionSchema.parse({
  apgPattern: 'dialog',
  rootRole: 'dialog',
  containedRoles: ['button'],
  focusModel: 'focusTrap',
  parts: {
    trigger: {
      role: 'button',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-haspopup', from: 'items.label' },
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      ],
      events: [
        { event: 'click', events: [{ type: 'expand', key: '$key', expanded: true }] },
      ],
    },
    dialog: {
      role: 'dialog',
      keySource: 'items',
      aria: [
        { attribute: 'aria-modal', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
        { attribute: 'aria-describedby', from: 'items.label' },
      ],
    },
    overlay: { role: 'presentation' },
    title: { role: 'heading' },
    description: { role: 'paragraph' },
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
        { case: 'always', events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      ],
    },
  ],
})

export const serializableDialogDefinition = JSON.parse(
  JSON.stringify(dialogDefinition),
) as typeof dialogDefinition
