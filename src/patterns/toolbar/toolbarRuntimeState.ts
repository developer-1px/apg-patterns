import type { Key, PatternData } from '../../schema'

export function getToolbarRuntimeState(data: PatternData): {
  activeKey: Key | null
  selectedKeys: readonly Key[]
  disabledKeys: readonly Key[]
} {
  return {
    activeKey: data.state?.activeKey ?? null,
    selectedKeys: data.state?.selectedKeys ?? [],
    disabledKeys: data.state?.disabledKeys ?? [],
  }
}
