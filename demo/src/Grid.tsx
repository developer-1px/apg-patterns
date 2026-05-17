import { useLayoutEffect, useState } from 'react'
import type { HTMLAttributes, KeyboardEvent } from 'react'
import { createPatternRuntime, gridDefinition, gridRows, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { Icon, type IconName } from './Icon'

type Props = HTMLAttributes<HTMLElement>

export function Grid({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<string>('')
  const editableKeys = ((data.state as { editableKeys?: readonly string[] } | undefined)?.editableKeys ?? []) as readonly string[]
  const valueByKey = data.state?.valueByKey ?? {}
  const sortByKey = data.state?.sortByKey ?? {}

  const runtime = createPatternRuntime({
    definition: gridDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options },
    onEvent: (event) => {
      // Translate Enter/F2 activate into edit-mode entry for editable cells, sort toggle for headers.
      if (event.type === 'activate') {
        const key = event.key
        const isHeader = data.items[key]?.kind === 'columnheader'
        if (isHeader) {
          const current = sortByKey[key]
          const next: 'ascending' | 'descending' | 'other' = current === 'ascending' ? 'descending' : 'ascending'
          onEvent({ type: 'extension', name: 'gridSort', key, payload: { sort: next } })
          return
        }
        if (editableKeys.includes(key)) {
          setEditingKey(key)
          setEditDraft(String(valueByKey[key] ?? data.items[key]?.label ?? ''))
          return
        }
      }
      if (event.type === 'dismiss') {
        setEditingKey(null)
        return
      }
      onEvent(event)
    },
    keyToElementId: (key) => `gridcell-${key}`,
  })

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey || editingKey) return
    document.getElementById(`gridcell-${CSS.escape(activeKey)}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey, editingKey])

  const commitEdit = () => {
    if (editingKey) onEvent({ type: 'value', key: editingKey, value: editDraft })
    setEditingKey(null)
  }
  const cancelEdit = () => setEditingKey(null)

  const handleEditKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      commitEdit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancelEdit()
    } else if (event.key === 'Tab') {
      event.stopPropagation()
      commitEdit()
    } else {
      // prevent grid navigation while editing
      event.stopPropagation()
    }
  }

  const rows = gridRows(data)
  const rootProps = runtime.getPartProps('grid') as Props

  return (
    <div
      {...rootProps}
      className="inline-grid overflow-hidden bg-white text-sm text-zinc-800 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:outline-zinc-500"
      style={{ gridTemplateColumns: `repeat(${data.relations?.columnKeys?.length ?? 1}, minmax(120px, 1fr))` }}
    >
      {(data.relations?.rowKeys ?? []).map((rowKey, rowIndex) => {
        const rowProps = runtime.getPartProps('row', rowKey) as Props
        return (
          <div key={rowKey} {...rowProps} className="contents">
            {rows[rowIndex]?.map((cellKey) => {
              const part = data.items[cellKey]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
              const cellProps = runtime.getPartProps(part, cellKey) as Props
              const state = runtime.getItemState(cellKey, part)
              const isEditing = editingKey === cellKey
              const isEditable = editableKeys.includes(cellKey)
              const displayValue = valueByKey[cellKey] !== undefined ? String(valueByKey[cellKey]) : data.items[cellKey]?.label
              const sortIcon: IconName | null = part === 'columnheader' && sortByKey[cellKey] ? (sortByKey[cellKey] === 'ascending' ? 'arrow-up' : 'arrow-down') : null
              return (
                <div
                  key={cellKey}
                  {...cellProps}
                  data-active={state.active ? '' : undefined}
                  data-editable={isEditable ? '' : undefined}
                  className="min-h-9 px-2 py-2 outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      data-edit=""
                      className="w-full bg-transparent outline-none ring-1 ring-zinc-400 px-1 dark:ring-zinc-500"
                      value={editDraft}
                      onChange={(event) => setEditDraft(event.currentTarget.value)}
                      onKeyDown={handleEditKeydown}
                      onBlur={commitEdit}
                    />
                  ) : (
                    <>{displayValue}{sortIcon ? <Icon name={sortIcon} className="ml-1 text-xs text-zinc-500" /> : null}</>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
