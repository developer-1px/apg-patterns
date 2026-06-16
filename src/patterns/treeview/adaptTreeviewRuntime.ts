import type { SlotProps } from '../../kernel/patternRuntime'
import type { ReactTreeviewRuntime } from '../../adapters/reactTypes'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import type { Key } from '../../schema'
import type { TreeviewRuntime } from './runtime'
import type { ReactTreeviewRenderItem } from './reactTypes'
import { createParentByKey, resolveVisibleOrder } from '../../kernel/patternKernel'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

export function adaptTreeviewRuntime(runtime: TreeviewRuntime): ReactTreeviewRuntime {
  const getTreeProps = () => adaptTreeviewProps(runtime.getTreeProps())
  const getTreeItemProps = (key: string) => adaptTreeviewProps(runtime.getTreeItemProps(key))
  const getIndicatorProps = (key: string) => adaptTreeviewIndicatorProps(runtime.getIndicatorProps(key))

  return {
    ...runtime,
    get items() {
      return runtime.items.map((item) => ({
        ...item,
        slotProps: {
          treeitem: adaptTreeviewProps(item.slotProps.treeitem),
          indicator: item.slotProps.indicator ? adaptTreeviewIndicatorProps(item.slotProps.indicator) : undefined,
        },
      }))
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    get rootProps() {
      return getTreeProps()
    },
    get renderItems() {
      return createTreeviewRenderItems(runtime, getTreeItemProps, getIndicatorProps)
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
        expandedKeys: runtime.data.state?.expandedKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
        toggle: (key: Key) => runtime.emit({ type: 'expand', key, expanded: !(runtime.data.state?.expandedKeys ?? []).includes(key) }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}

function adaptTreeviewProps(props: SlotProps): ReactPatternProps {
  return props as ReactPatternProps
}

function adaptTreeviewIndicatorProps(props: SlotProps): ReactPatternProps {
  const reactProps = adaptTreeviewProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    type: 'button',
    tabIndex: -1,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  } as ReactPatternProps
}

function createTreeviewRenderItems(
  runtime: TreeviewRuntime,
  getTreeItemProps: (key: Key) => ReactPatternProps,
  getIndicatorProps: (key: Key) => ReactPatternProps,
): readonly ReactTreeviewRenderItem[] {
  const parentByKey = createParentByKey(runtime.data)
  const indexInParentByKey = new Map<Key, number>()
  for (const [index, key] of (runtime.data.relations?.rootKeys ?? []).entries()) {
    indexInParentByKey.set(key, index + 1)
  }
  for (const children of Object.values(runtime.data.relations?.childrenByKey ?? {})) {
    for (const [index, key] of children.entries()) {
      indexInParentByKey.set(key, index + 1)
    }
  }
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
  const state = runtime.getTreeItemState(key)
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
