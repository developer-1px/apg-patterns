import { PatternDefinitionSchema } from '../../schema'
import { dialogEffects } from './effects'
import { dialogKeyboard } from './keyboard'
import { dialogParts } from './parts'
import { dialogTransitions } from './transitions'

export const DialogDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'dialog') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "dialog"' })
  if (value.rootRole !== 'dialog') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "dialog"' })
  if (!value.parts.dialog) ctx.addIssue({ code: 'custom', path: ['parts', 'dialog'], message: 'dialog requires parts.dialog' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'dialog requires parts.trigger' })
  if (!value.parts.cancel) ctx.addIssue({ code: 'custom', path: ['parts', 'cancel'], message: 'dialog requires parts.cancel' })
  if (!value.parts.submit) ctx.addIssue({ code: 'custom', path: ['parts', 'submit'], message: 'dialog requires parts.submit' })
})

export const dialogDefinition = DialogDefinitionSchema.parse({
  apgPattern: 'dialog',
  rootRole: 'dialog',
  containedRoles: ['button'],
  focusModel: 'focusTrap',
  parts: dialogParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: dialogKeyboard,
  transitions: dialogTransitions,
  effects: dialogEffects,
})
