import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
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
export const toolbarDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'toolbar') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "toolbar"' })
  if (value.rootRole !== 'toolbar') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "toolbar"' })
  if (!value.parts.toolbar) ctx.addIssue({ code: 'custom', path: ['parts', 'toolbar'], message: 'toolbar requires parts.toolbar' })
  if (!value.parts.item) ctx.addIssue({ code: 'custom', path: ['parts', 'item'], message: 'toolbar requires parts.item' })
}).parse({
  apgPattern: 'toolbar',
  rootRole: 'toolbar',
  containedRoles: ['button', 'combobox', 'group', 'menu', 'menubar'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
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
