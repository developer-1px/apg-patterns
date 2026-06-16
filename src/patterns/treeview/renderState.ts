export type TreeviewRenderState = Record<'active' | 'selected' | 'disabled' | 'expanded', boolean> & {
  checked?: boolean | 'mixed'
}

export function toTreeviewRenderState(state: Record<string, unknown>): TreeviewRenderState {
  const out: TreeviewRenderState = { active: false, selected: false, disabled: false, expanded: false }
  out.active = Boolean(state.active)
  out.selected = Boolean(state.selected)
  out.disabled = Boolean(state.disabled)
  out.expanded = Boolean(state.expanded)
  if (state.checked !== undefined) out.checked = state.checked as boolean | 'mixed'
  return out
}
