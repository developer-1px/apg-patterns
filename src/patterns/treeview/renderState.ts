import type { Key, PatternData } from '../../schema'
import { PatternDataSchema } from '../../schema'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { treeviewDefinition } from './definition'

export type TreeviewRenderState = Record<'active' | 'selected' | 'disabled' | 'expanded', boolean> & {
  checked?: boolean | 'mixed'
}

const defaultStateOptions = {
  selectionMode: 'single',
  focusStrategy: 'rovingTabIndex',
  followFocus: false,
  itemClickAction: 'select',
  indicatorClickAction: 'toggleExpand',
  typeaheadEnabled: true,
  elementIdPrefix: 'treeitem-',
} as const

export function getTreeItemState(data: PatternData, key: Key): TreeviewRenderState {
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data: PatternDataSchema.parse(data),
    options: defaultStateOptions,
    onEvent: () => undefined,
  })
  const state = runtime.getItemState(key, 'treeitem')
  const out: TreeviewRenderState = { active: false, selected: false, disabled: false, expanded: false }
  out.active = Boolean(state.active)
  out.selected = Boolean(state.selected)
  out.disabled = Boolean(state.disabled)
  out.expanded = Boolean(state.expanded)
  if (state.checked !== undefined) out.checked = state.checked as boolean | 'mixed'
  return out
}
