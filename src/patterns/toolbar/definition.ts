import { PatternDefinitionSchema } from '../../schema'
import { toolbarEffects } from './effects'
import { toolbarKeyboard } from './keyboard'
import { toolbarParts } from './parts'

// APG Toolbar pattern
// https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
//
// Structure: <div role="toolbar" aria-label aria-orientation> with focusable
// children (buttons, toggle buttons, radio group). Single tab stop into the
// toolbar (roving tabindex). Arrow keys move focus among siblings; Home/End
// jump to first/last. Horizontal orientation uses ArrowLeft/Right; vertical
// uses ArrowUp/Down.
export const ToolbarDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'toolbar') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "toolbar"' })
  if (value.rootRole !== 'toolbar') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "toolbar"' })
  if (!value.parts.toolbar) ctx.addIssue({ code: 'custom', path: ['parts', 'toolbar'], message: 'toolbar requires parts.toolbar' })
  if (!value.parts.item) ctx.addIssue({ code: 'custom', path: ['parts', 'item'], message: 'toolbar requires parts.item' })
})

export const toolbarDefinition = ToolbarDefinitionSchema.parse({
  apgPattern: 'toolbar',
  rootRole: 'toolbar',
  containedRoles: ['button'],
  focusModel: 'rovingTabIndex',
  effects: toolbarEffects,
  parts: toolbarParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: toolbarKeyboard,
})
