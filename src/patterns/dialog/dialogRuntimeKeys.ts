import type { Key, PatternData } from '../../schema'

export function isDialogOpen(data: PatternData): boolean {
  return data.state?.expandedKeys?.includes('trigger') ?? false
}

export function labelDialogItem(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}
