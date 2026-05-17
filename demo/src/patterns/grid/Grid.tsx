import { useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent } from 'react'
import { createPatternRuntime, gridDefinition, gridRows, usePatternEffects, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { Icon, type IconName } from '../../shared/Icon'

type Props = HTMLAttributes<HTMLElement>

export function Grid({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = ((data.state as { options?: PatternOptions; multiselectable?: boolean } | undefined)?.options ?? {}) as PatternOptions
  const selectionMode = (data.state as { multiselectable?: boolean } | undefined)?.multiselectable ? 'multiple' : 'single'
  const editableKeys = ((data.state as { editableKeys?: readonly string[] } | undefined)?.editableKeys ?? []) as readonly string[]
  const editingKey = ((data.state as { editingKey?: string | null } | undefined)?.editingKey ?? null) as string | null
  const editDraftByKey = ((data.state as { editDraftByKey?: Record<string, string> } | undefined)?.editDraftByKey ?? {}) as Record<string, string>
  const valueByKey = data.state?.valueByKey ?? {}
  const sortByKey = data.state?.sortByKey ?? {}
  const rootRef = useRef<HTMLDivElement>(null)

  const runtime = createPatternRuntime({
    definition: gridDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode, ...options },
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
          onEvent({
            type: 'extension',
            name: 'gridEditStart',
            key,
            payload: { value: String(valueByKey[key] ?? data.items[key]?.label ?? '') },
          })
          return
        }
      }
      if (event.type === 'dismiss') {
        onEvent({ type: 'extension', name: 'gridEditEnd' })
        return
      }
      onEvent(event)
    },
    keyToElementId: (key) => `gridcell-${key}`,
  })

  usePatternEffects({ definition: gridDefinition, data, keyToElementId: runtime.keyToElementId })

  const commitEdit = () => {
    if (editingKey) {
      onEvent({ type: 'value', key: editingKey, value: editDraftByKey[editingKey] ?? '' })
      onEvent({ type: 'extension', name: 'gridEditEnd' })
    }
  }
  const cancelEdit = () => onEvent({ type: 'extension', name: 'gridEditEnd' })

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
      ref={rootRef}
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
                      value={editDraftByKey[cellKey] ?? ''}
                      onChange={(event) =>
                        onEvent({ type: 'extension', name: 'gridEditDraft', key: cellKey, payload: { value: event.currentTarget.value } })
                      }
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
