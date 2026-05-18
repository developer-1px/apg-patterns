import type { Key } from '../../schema'
import type { TreeviewRuntime } from './runtime'

export function getTreeviewReactState(runtime: TreeviewRuntime): {
  activeKey: Key | null
  selectedKeys: readonly Key[]
  disabledKeys: readonly Key[]
  expandedKeys: readonly Key[]
} {
  return {
    activeKey: runtime.data.state?.activeKey ?? null,
    selectedKeys: runtime.data.state?.selectedKeys ?? [],
    disabledKeys: runtime.data.state?.disabledKeys ?? [],
    expandedKeys: runtime.data.state?.expandedKeys ?? [],
  }
}
