import { PatternDefinitionSchema } from '../../schema'
import { alertDialogEffects } from './effects'
import { alertDialogKeyboard } from './keyboard'
import { alertDialogParts } from './parts'
import { alertDialogTransitions } from './transitions'

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
  parts: alertDialogParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: alertDialogKeyboard,
  transitions: alertDialogTransitions,
  effects: alertDialogEffects,
})
