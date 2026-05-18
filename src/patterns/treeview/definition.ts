import { PatternDefinitionSchema } from '../../schema'
import { treeviewKeyboard } from './keyboard'
import './navigation'

const itemIsDisabled = { kind: 'isDisabled', key: '$key' } as const
const itemClickSelect = { kind: 'optionEquals', option: 'itemClickAction', value: 'select' } as const
const itemClickToggleExpand = { kind: 'optionEquals', option: 'itemClickAction', value: 'toggleExpand' } as const
const indicatorClickToggleExpand = { kind: 'optionEquals', option: 'indicatorClickAction', value: 'toggleExpand' } as const

export const TreeviewDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  const containedRoles = value.containedRoles ?? []
  if (value.apgPattern !== 'treeview') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "treeview"' })
  if (value.rootRole !== 'tree') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "tree"' })
  if (containedRoles.length !== 1 || containedRoles[0] !== 'treeitem') {
    ctx.addIssue({ code: 'custom', path: ['containedRoles'], message: 'expected ["treeitem"]' })
  }
  if (!value.parts.tree) ctx.addIssue({ code: 'custom', path: ['parts', 'tree'], message: 'treeview requires parts.tree' })
  if (!value.parts.treeitem) ctx.addIssue({ code: 'custom', path: ['parts', 'treeitem'], message: 'treeview requires parts.treeitem' })
})

export const treeviewDefinition = TreeviewDefinitionSchema.parse({
  apgPattern: 'treeview',
  rootRole: 'tree',
  containedRoles: ['treeitem'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    tree: {
      role: 'tree',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
        {
          attribute: 'aria-activedescendant',
          from: 'state.activeKey.elementId',
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
        },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
          value: 0,
        },
      },
    },
    treeitem: {
      role: 'treeitem',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
        { attribute: 'aria-expanded', from: 'state.expandedKeys', when: { kind: 'hasChildren', key: '$key' } },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
        { attribute: 'aria-level', from: 'state.levelByKey' },
        { attribute: 'aria-posinset', from: 'state.posInSetByKey' },
        { attribute: 'aria-setsize', from: 'state.setSizeByKey' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
          active: 0,
          inactive: -1,
        },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
        { name: 'expanded', from: 'state.expandedKeys' },
        { name: 'checked', from: 'state.checkedByKey' },
      ],
      events: [
        { event: 'focus', when: { kind: 'not', predicate: itemIsDisabled }, events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', when: { kind: 'not', predicate: itemIsDisabled }, events: [{ type: 'focus', key: '$key' }] },
        {
          event: 'click',
          when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, itemClickSelect] },
          events: [{ type: 'select', key: '$key' }],
        },
        {
          event: 'click',
          when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'hasChildren', key: '$key' }, itemClickToggleExpand] },
          events: [{ type: 'expand', key: '$key' }],
        },
        {
          event: 'focus',
          when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'optionEquals', option: 'followFocus', value: true }] },
          events: [{ type: 'select', key: '$key' }],
        },
      ],
    },
    indicator: {
      role: 'presentation',
      events: [
        {
          event: 'click',
          when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'hasChildren', key: '$key' }, indicatorClickToggleExpand] },
          events: [
            { type: 'focus', key: '$key' },
            { type: 'expand', key: '$key' },
          ],
        },
      ],
    },
  },
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
