import type { Key, PatternData } from '../../schema'
import { PatternDataSchema } from '../../schema'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { treeviewDefaultOptions } from './defaultOptions'
import { treeviewDefinition } from './definition'

export type TreeviewRenderState = Record<'active' | 'selected' | 'disabled' | 'expanded', boolean> & {
  checked?: boolean | 'mixed'
}

export function getTreeItemState(data: PatternData, key: Key): TreeviewRenderState {
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data: PatternDataSchema.parse(data),
    options: treeviewDefaultOptions,
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
