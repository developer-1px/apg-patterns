import type { Key, PatternData } from '../../schema'

export function getSwitchRuntimeState(data: PatternData): {
  activeKey: Key | null
  checkedByKey: Readonly<Record<Key, boolean | 'mixed'>>
  disabledKeys: readonly Key[]
} {
  return {
    activeKey: data.state?.activeKey ?? null,
    checkedByKey: data.state?.checkedByKey ?? {},
    disabledKeys: data.state?.disabledKeys ?? [],
  }
}
