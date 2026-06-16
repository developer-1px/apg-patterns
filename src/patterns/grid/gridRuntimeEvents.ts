import type { Key, PatternData, PatternEvent } from '../../schema'
import { withDefaultReason } from '../../kernel/domEventBindings'

type GridValue = string | number | boolean | null
type GridSort = 'ascending' | 'descending' | 'other'

export function createGridRuntimeEventHandler({
  data,
  editableKeys,
  editingKey,
  valueByKey,
  sortByKey,
  onEvent,
}: {
  data: PatternData
  editableKeys: readonly string[]
  editingKey: string | null
  valueByKey: Readonly<Record<Key, GridValue>>
  sortByKey: Readonly<Record<Key, GridSort>>
  onEvent(event: PatternEvent): void
}): (event: PatternEvent) => void {
  return (event) => {
    if (event.type === 'activate') {
      const key = event.key
      const item = data.items[key]
      if (item?.kind === 'columnheader' && (item.sortable === true || Object.prototype.hasOwnProperty.call(sortByKey, key))) {
        const current = sortByKey[key]
        onEvent(withDefaultReason({ type: 'sort', key, sort: current === 'ascending' ? 'descending' : 'ascending' }, event.meta?.reason ?? 'external'))
        return
      }
      if (editableKeys.includes(key)) {
        onEvent(withDefaultReason({ type: 'editStart', key, value: String(valueByKey[key] ?? item?.label ?? '') }, event.meta?.reason ?? 'external'))
        return
      }
    }
    if (event.type === 'dismiss') {
      onEvent(withDefaultReason({ type: 'editEnd', key: editingKey ?? undefined }, event.meta?.reason ?? 'external'))
      return
    }
    onEvent(event)
  }
}

export function createGridEditActions({
  editingKey,
  editDraftByKey,
  onEvent,
}: {
  editingKey: string | null
  editDraftByKey: Record<string, GridValue>
  onEvent(event: PatternEvent): void
}): {
  commitEdit(): void
  cancelEdit(): void
} {
  return {
    commitEdit() {
      if (!editingKey) return
      onEvent(withDefaultReason({ type: 'value', key: editingKey, value: String(editDraftByKey[editingKey] ?? '') }, 'external'))
      onEvent(withDefaultReason({ type: 'editEnd', key: editingKey }, 'external'))
    },
    cancelEdit() {
      onEvent(withDefaultReason({ type: 'editEnd', key: editingKey ?? undefined }, 'external'))
    },
  }
}
