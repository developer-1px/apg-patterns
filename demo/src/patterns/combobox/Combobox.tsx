import { useRef } from 'react'
import type { HTMLAttributes, InputHTMLAttributes, KeyboardEvent } from 'react'
import { COMBOBOX_KEY, comboboxDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '../../../../src'
import type { ComboboxVariantKey } from './comboboxData'

type RootProps = InputHTMLAttributes<HTMLInputElement> & { onKeyDown: (e: KeyboardEvent) => void }

export function Combobox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const variant = (data.state?.variant as ComboboxVariantKey | undefined) ?? 'listAutocomplete'
  const autocomplete = variant === 'selectOnly' ? 'none' : variant === 'listAutocomplete' ? 'list' : 'both'
  const editable = variant !== 'selectOnly'
  const listboxId = 'combobox-popup'
  const inputRef = useRef<HTMLInputElement>(null)
  const query = ((data.state as { query?: string } | undefined)?.query ?? '') as string
  const inlineCompletion = ((data.state as { inlineCompletion?: { start: number; end: number } | null } | undefined)?.inlineCompletion ?? null) as {
    start: number
    end: number
  } | null

  const runtime = createPatternRuntime({
    definition: comboboxDefinition,
    data,
    options: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete },
    onEvent,
    keyToElementId: (key) => `combobox-option-${key}`,
  })

  const rootProps = runtime.getPartProps('combobox') as unknown as RootProps
  const listProps = runtime.getPartProps('listbox') as HTMLAttributes<HTMLElement>
  const open = data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false
  const selectedKey = data.state?.selectedKeys?.[0]
  const visibleKeys = Object.keys(data.items).filter((k) => k !== COMBOBOX_KEY)
  const selectedLabel = selectedKey ? data.items[selectedKey]?.label ?? '' : ''

  const displayValue = editable ? (selectedKey && !open ? selectedLabel : query) : selectedLabel

  const setInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (variant === 'listWithInlineAutocomplete' && inlineCompletion && node) {
      node.setSelectionRange(inlineCompletion.start, inlineCompletion.end)
    }
  }

  const handleInput = (next: string) => {
    if (variant === 'selectOnly') return
    onEvent({ type: 'inputValue', key: COMBOBOX_KEY, value: next, inline: variant === 'listWithInlineAutocomplete' })
  }

  const handleSelectOnlyTypeahead = (key: string) => {
    if (!/^[\w]$/.test(key)) return false
    onEvent({ type: 'typeahead', query: key.toLowerCase() })
    return true
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Select-only typeahead.
    if (variant === 'selectOnly' && event.key.length === 1 && handleSelectOnlyTypeahead(event.key)) {
      event.preventDefault()
      return
    }
    rootProps.onKeyDown?.(event as unknown as Parameters<NonNullable<RootProps['onKeyDown']>>[0])
  }

  // Wrapper container so we can host the popup as a sibling of the input.
  return (
    <div className="relative grid max-w-sm gap-1">
      <input
        ref={setInputRef}
        {...(rootProps as InputHTMLAttributes<HTMLInputElement>)}
        type="text"
        readOnly={!editable}
        value={displayValue}
        placeholder={editable ? 'Type a fruit (e.g. Apple) — ↓ opens' : 'Pick a fruit — ↓ opens'}
        aria-controls={listboxId}
        onChange={(e) => editable && handleInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        onClick={() => !open && onEvent({ type: 'expand', key: COMBOBOX_KEY, expanded: true })}
        className="h-9 w-full rounded border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:outline-zinc-500"
      />
      {open ? (
        <div
          {...listProps}
          id={listboxId}
          className="absolute left-0 right-0 top-10 z-10 max-h-56 overflow-auto rounded border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          {visibleKeys.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-zinc-500">No matches</div>
          ) : (
            visibleKeys.map((key) => {
              const optionProps = runtime.getPartProps('option', key) as HTMLAttributes<HTMLElement>
              const state = runtime.getItemState(key, 'option')
              return (
                <div
                  key={key}
                  {...optionProps}
                  data-active={state.active ? '' : undefined}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onEvent({ type: 'select', keys: [key], anchorKey: key, extentKey: key })
                    onEvent({ type: 'expand', key: COMBOBOX_KEY, expanded: false })
                    if (editable) {
                      onEvent({ type: 'commitValue', key, value: data.items[key]?.label ?? '' })
                    }
                  }}
                  className="cursor-pointer px-2 py-1.5 text-sm text-zinc-800 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 dark:text-zinc-200 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900"
                >
                  {data.items[key]?.label}
                </div>
              )
            })
          )}
        </div>
      ) : null}
    </div>
  )
}
