import type { Key } from '../../schema'
import type { ReactTreeviewRuntime } from '../../adapters/reactTypes'
import type { TreeviewRuntime } from './runtime'
import { adaptTreeviewIndicatorProps, adaptTreeviewProps } from './adaptTreeviewProps'
import { createTreeviewRenderItems } from './createTreeviewRenderItems'

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
