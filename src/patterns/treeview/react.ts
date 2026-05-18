import type { ReactFacade } from '../../schema'

export const treeviewReact = {
  hook: 'useTreeviewPattern',
  root: { prop: 'rootProps', part: 'tree', element: 'div' },
  renderItems: {
    name: 'renderItems',
    source: { kind: 'visibleOrder' },
    order: 'treePreorderVisible',
    variants: [
      {
        kind: 'leaf',
        when: { kind: 'not', predicate: { kind: 'hasChildren', key: '$key' } },
        fields: {
          key: { kind: 'key' },
          kind: { kind: 'literal', value: 'leaf' },
          label: { kind: 'itemField', field: 'label', fallback: 'key' },
          textValue: { kind: 'textValue', fallback: 'label' },
          level: { kind: 'treeLevel', base: 1 },
          parentKey: { kind: 'treeParentKey', rootValue: null },
          indexInParent: { kind: 'treeIndexInParent', base: 1 },
          state: { kind: 'partState', part: 'treeitem' },
        },
        props: {
          treeitemProps: { part: 'treeitem', element: 'div', owner: 'item' },
        },
      },
      {
        kind: 'branch',
        when: { kind: 'hasChildren', key: '$key' },
        fields: {
          key: { kind: 'key' },
          kind: { kind: 'literal', value: 'branch' },
          label: { kind: 'itemField', field: 'label', fallback: 'key' },
          textValue: { kind: 'textValue', fallback: 'label' },
          level: { kind: 'treeLevel', base: 1 },
          parentKey: { kind: 'treeParentKey', rootValue: null },
          indexInParent: { kind: 'treeIndexInParent', base: 1 },
          state: { kind: 'partState', part: 'treeitem' },
        },
        props: {
          treeitemProps: { part: 'treeitem', element: 'div', owner: 'item' },
          toggleButtonProps: {
            part: 'indicator',
            element: 'button',
            owner: 'toggle',
            defaults: { type: 'button', tabIndex: -1 },
            stopsPropagation: true,
          },
        },
      },
    ],
  },
} satisfies ReactFacade
