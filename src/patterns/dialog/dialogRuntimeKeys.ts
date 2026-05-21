import type { Key, PatternData, PatternOptions } from '../../schema'
import { createElementId } from '../../kernel/domIds'

export function createDialogElementId(options: PatternOptions): (key: Key) => string {
  return (key) => createElementId(options.elementIdPrefix ?? 'dialog-', key)
}

export function isDialogOpen(data: PatternData): boolean {
  return data.state?.expandedKeys?.includes('trigger') ?? false
}

export function labelDialogItem(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}
