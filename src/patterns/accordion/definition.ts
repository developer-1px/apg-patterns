import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { accordionKeyboard } from './keyboard'
import { accordionParts } from './parts'

export const accordionDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'accordion') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "accordion"' })
  if (value.rootRole !== 'group') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "group"' })
  if (!value.parts.accordion) ctx.addIssue({ code: 'custom', path: ['parts', 'accordion'], message: 'accordion requires parts.accordion' })
  if (!value.parts.header) ctx.addIssue({ code: 'custom', path: ['parts', 'header'], message: 'accordion requires parts.header' })
  if (!value.parts.panel) ctx.addIssue({ code: 'custom', path: ['parts', 'panel'], message: 'accordion requires parts.panel' })
}).parse({
  apgPattern: 'accordion',
  rootRole: 'group',
  containedRoles: ['button', 'region'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: accordionParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: accordionKeyboard,
  react: {
    hook: 'useAccordionPattern',
    root: { prop: 'rootProps', part: 'accordion', element: 'div' },
    renderItems: {
      name: 'renderItems',
      source: { kind: 'visibleOrder' },
      order: 'flat',
      variants: [
        {
          kind: 'section',
          when: { kind: 'always' },
          fields: {
            key: { kind: 'key' },
            kind: { kind: 'literal', value: 'section' },
            label: { kind: 'itemField', field: 'label', fallback: 'key' },
            textValue: { kind: 'textValue', fallback: 'label' },
            panelKey: { kind: 'firstControlledKey', fallback: null },
            state: { kind: 'partState', part: 'header' },
          },
          props: {
            headerProps: { part: 'header', element: 'button', owner: 'item', defaults: { type: 'button' } },
            panelProps: { part: 'panel', element: 'div', owner: 'panel' },
          },
        },
      ],
    },
  },
})
