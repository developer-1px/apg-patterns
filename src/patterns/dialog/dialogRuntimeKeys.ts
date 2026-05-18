import type { Key, PatternDataWithOptions, PatternOptions } from '../../schema'

export function createDialogElementId(options: PatternOptions): (key: Key) => string {
  return (key) => key === 'dialog' ? 'dialog-panel' : `${options.elementIdPrefix ?? 'dialog-'}${key}`
}

export function isDialogOpen(data: PatternDataWithOptions): boolean {
  return data.state?.expandedKeys?.includes('trigger') ?? false
}

export function labelDialogItem(data: PatternDataWithOptions, key: Key): string {
  return data.items[key]?.label ?? key
}
