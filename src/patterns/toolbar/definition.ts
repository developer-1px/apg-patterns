import { PatternDefinitionSchema } from '../../schema'

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
  parts: {
    toolbar: {
      role: 'toolbar',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
      ],
    },
    item: {
      role: 'button',
      keySource: 'collectionItemKey',
      aria: [
        { attribute: 'aria-pressed', from: 'state.selectedKeys' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'always' },
          active: 0,
          inactive: -1,
        },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'pressed', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }, { type: 'select', key: '$key' }] },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'horizontal' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'horizontal' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  ],
})

export const serializableToolbarDefinition = JSON.parse(
  JSON.stringify(toolbarDefinition),
) as typeof toolbarDefinition
