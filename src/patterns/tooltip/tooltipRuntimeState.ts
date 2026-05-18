import type { Key, PatternData } from '../../schema'

export function getTooltipLabel(data: PatternData, key: Key | null): string {
  return key ? data.items[key]?.label ?? key : ''
}

export function getTooltipRuntimeState(data: PatternData, triggerKey: Key | null): {
  open: boolean
} {
  return {
    open: triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false,
  }
}
