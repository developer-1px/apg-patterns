import type { Key, PatternData, PatternEvent } from '../../schema'

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
      if (data.items[key]?.kind === 'columnheader' && isSortableColumnHeader(data, sortByKey, key)) {
        const current = sortByKey[key]
        onEvent({ type: 'sort', key, sort: current === 'ascending' ? 'descending' : 'ascending' })
        return
      }
      if (editableKeys.includes(key)) {
        onEvent({ type: 'editStart', key, value: String(valueByKey[key] ?? data.items[key]?.label ?? '') })
        return
      }
    }
    if (event.type === 'dismiss') {
      onEvent({ type: 'editEnd', key: editingKey ?? undefined })
      return
    }
    onEvent(event)
  }
}

function isSortableColumnHeader(data: PatternData, sortByKey: Readonly<Record<Key, GridSort>>, key: Key): boolean {
  return data.items[key]?.sortable === true || Object.prototype.hasOwnProperty.call(sortByKey, key)
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
      onEvent({ type: 'value', key: editingKey, value: String(editDraftByKey[editingKey] ?? '') })
      onEvent({ type: 'editEnd', key: editingKey })
    },
    cancelEdit() {
      onEvent({ type: 'editEnd', key: editingKey ?? undefined })
    },
  }
}
