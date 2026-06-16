import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { treeviewKeyboard } from './keyboard'
import { registerTreeviewNavigation } from './navigation'
import { treeviewParts } from './parts'

registerTreeviewNavigation()

export const treeviewDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  const containedRoles = value.containedRoles ?? []
  if (value.apgPattern !== 'treeview') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "treeview"' })
  if (value.rootRole !== 'tree') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "tree"' })
  if (containedRoles.length !== 1 || containedRoles[0] !== 'treeitem') {
    ctx.addIssue({ code: 'custom', path: ['containedRoles'], message: 'expected ["treeitem"]' })
  }
  if (!value.parts.tree) ctx.addIssue({ code: 'custom', path: ['parts', 'tree'], message: 'treeview requires parts.tree' })
  if (!value.parts.treeitem) ctx.addIssue({ code: 'custom', path: ['parts', 'treeitem'], message: 'treeview requires parts.treeitem' })
}).parse({
  apgPattern: 'treeview',
  rootRole: 'tree',
  containedRoles: ['treeitem'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: treeviewParts,
  navigation: {
    visibleOrder: { kind: 'treeVisibleDepthFirst' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
      child: { kind: 'firstChild', key: '$activeKey' },
      parent: { kind: 'parentKey', key: '$activeKey' },
    },
  },
  keyboard: treeviewKeyboard,
  react: {
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
  },
})
