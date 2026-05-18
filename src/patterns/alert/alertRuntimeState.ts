import type { Key, PatternData } from '../../schema'

export function getAlertMessage(data: PatternData<{ message?: unknown }>, key: Key | null): string {
  return key ? String(data.items[key]?.message ?? '') : ''
}

export function getAlertRuntimeState(data: PatternData, key: Key | null): {
  visible: boolean
} {
  return {
    visible: key ? (data.state?.expandedKeys ?? []).includes(key) : false,
  }
}
