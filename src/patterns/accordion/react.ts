import type { ReactFacade } from '../../schema/reactFacade'

export const accordionReact = {
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
} satisfies ReactFacade
