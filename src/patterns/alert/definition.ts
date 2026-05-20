import type { ZodType } from 'zod'
import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { alertKeyboard } from './keyboard'
import { alertParts } from './parts'

export const AlertDefinitionSchema: ZodType<PatternDefinition> = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'alert') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "alert"' })
  if (value.rootRole !== 'alert') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "alert"' })
  if (!value.parts.alert) ctx.addIssue({ code: 'custom', path: ['parts', 'alert'], message: 'alert requires parts.alert' })
})

// APG Alert pattern.
//   - role="alert" implies aria-live="assertive" and aria-atomic="true".
//   - No focus management; no keyboard interaction on the alert itself.
//   - Optional dismiss button: Escape or click → emits dismiss / expand:false.
// State model: an alert key is "visible" iff it is present in state.expandedKeys.
export const alertDefinition: PatternDefinition = AlertDefinitionSchema.parse({
  apgPattern: 'alert',
  rootRole: 'alert',
  containedRoles: [],
  parts: alertParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: alertKeyboard,
})
