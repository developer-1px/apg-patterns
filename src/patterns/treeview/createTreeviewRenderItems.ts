import { createParentByKey, resolveVisibleOrder } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import type { ReactTreeviewRenderItem } from './reactTypes'
import type { TreeviewRuntime } from './runtime'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

export function createTreeviewRenderItems(
  runtime: TreeviewRuntime,
  getTreeItemProps: (key: Key) => ReactPatternProps,
  getIndicatorProps: (key: Key) => ReactPatternProps,
): readonly ReactTreeviewRenderItem[] {
  const parentByKey = createParentByKey(runtime.data)
  const indexInParentByKey = createIndexInParentByKey(runtime.data)
  const visibleKeys = resolveVisibleOrder(runtime.definition.navigation.visibleOrder, runtime.data)
  return visibleKeys.map((key) => {
    const hasChildren = (runtime.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
    const base = {
      key,
      label: getPatternItemLabel(runtime.data, key),
      textValue: getPatternItemTextValue(runtime.data, key),
      level: runtime.data.state?.levelByKey?.[key] ?? 1,
      parentKey: parentByKey.get(key) ?? null,
      indexInParent: indexInParentByKey.get(key) ?? 1,
      treeitemProps: getTreeItemProps(key),
    }
    if (!hasChildren) {
      return {
        kind: 'leaf',
        ...base,
        state: getTreeItemRenderState(runtime, key, false),
      }
    }
    return {
      kind: 'branch',
      ...base,
      state: getTreeItemRenderState(runtime, key, true),
      toggleButtonProps: getIndicatorProps(key),
    }
  })
}

function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: false): ReactRenderItemState
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: true): ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: boolean): ReactRenderItemState | (ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }) {
  const state = typeof runtime.getTreeItemState === 'function'
    ? runtime.getTreeItemState(key)
    : runtime.items.find((item) => item.key === key)?.state ?? { active: false, selected: false, disabled: false, expanded: false }
  const base = {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
  if (!branch) return base
  return {
    ...base,
    expanded: Boolean(state.expanded),
    toggleDisabled: Boolean(state.disabled),
  }
}

function createIndexInParentByKey(data: PatternData): ReadonlyMap<Key, number> {
  const indexInParentByKey = new Map<Key, number>()
  for (const [index, key] of (data.relations?.rootKeys ?? []).entries()) {
    indexInParentByKey.set(key, index + 1)
  }
  for (const children of Object.values(data.relations?.childrenByKey ?? {})) {
    for (const [index, key] of children.entries()) {
      indexInParentByKey.set(key, index + 1)
    }
  }
  return indexInParentByKey
}
