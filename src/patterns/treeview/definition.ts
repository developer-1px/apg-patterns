import { PatternDefinitionSchema } from '../../schema'
import { treeviewKeyboard } from './keyboard'
import { registerTreeviewNavigation } from './navigation'
import { treeviewParts } from './parts'
import { treeviewReact } from './react'

registerTreeviewNavigation()

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
  react: treeviewReact,
})
