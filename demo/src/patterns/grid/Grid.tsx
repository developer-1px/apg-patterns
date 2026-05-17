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
          onEvent({ type: 'sort', key, sort: next })
          return
        }
        if (editableKeys.includes(key)) {
          onEvent({
            type: 'editStart',
            key,
            value: String(valueByKey[key] ?? data.items[key]?.label ?? ''),
          })
          return
        }
      }
      if (event.type === 'dismiss') {
        onEvent({ type: 'editEnd', key: editingKey ?? undefined })
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
      onEvent({ type: 'editEnd', key: editingKey })
    }
  }
  const cancelEdit = () => onEvent({ type: 'editEnd', key: editingKey ?? undefined })

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
      className="inline-grid overflow-hidden rounded-xl bg-white/80 text-sm text-zinc-800 shadow-sm shadow-zinc-200/70 ring-1 ring-black/[0.03] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 dark:bg-white/[0.04] dark:text-zinc-300 dark:shadow-black/20 dark:ring-white/[0.05] dark:focus-visible:outline-zinc-500"
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
                  className="min-h-9 px-2 py-2 outline-none aria-selected:bg-zinc-100/90 aria-selected:text-zinc-950 data-active:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 dark:aria-selected:bg-white/[0.08] dark:aria-selected:text-zinc-50 dark:data-active:bg-white/[0.05] dark:focus-visible:outline-zinc-500"
                >
                  {isEditing ? (
                    <input
                      data-edit=""
                      className="w-full rounded-md bg-white/80 px-1 outline-none ring-1 ring-black/10 dark:bg-white/[0.06] dark:ring-white/10"
                      value={editDraftByKey[cellKey] ?? ''}
                      onChange={(event) =>
                        onEvent({ type: 'editDraft', key: cellKey, value: event.currentTarget.value })
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
