import type { ReactTreeviewRuntime } from '../../adapters/reactTypes'
import type { TreeviewRuntime } from './runtime'
import { adaptTreeviewIndicatorProps, adaptTreeviewProps } from './adaptTreeviewProps'
import { createTreeviewRenderItems } from './createTreeviewRenderItems'
import { createTreeviewReactActions } from './treeviewReactActions'
import { getTreeviewReactState } from './treeviewReactState'

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
      return getTreeviewReactState(runtime)
    },
    get actions() {
      return createTreeviewReactActions(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}
