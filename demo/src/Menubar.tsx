import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPatternRuntime, menubarDefinition, type PatternData, type PatternEvent } from '../../src'
import { Icon } from './Icon'
import type { MenuProps } from './menuTypes'

type Props = HTMLAttributes<HTMLElement>

export function Menubar({ data, onEvent }: MenuProps) {
  const runtime = createPatternRuntime({
    definition: menubarDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', orientation: 'horizontal' },
    onEvent,
    keyToElementId: (key) => `menubar-${key}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  const typeahead = useTypeahead(data, rootKeys, onEvent)
  const rootProps = runtime.getPartProps('menubar') as Props

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (activeKey && rootKeys.includes(activeKey)) document.getElementById(`menubar-${activeKey}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey, rootKeys])

  return (
    <div className="grid gap-2">
      <div {...rootProps} onKeyDown={(event) => handleMenubarKey(event, rootProps.onKeyDown as ((event: ReactKeyboardEvent) => void) | undefined, typeahead)} className="flex items-center gap-0.5 rounded bg-zinc-50 px-1 py-1 outline-none dark:bg-zinc-900">
        {rootKeys.map((key) => (
          <RootMenuItem key={key} itemKey={key} data={data} runtime={runtime} expanded={(data.state?.expandedKeys ?? []).includes(key)} />
        ))}
      </div>
      {rootKeys.filter((key) => (data.state?.expandedKeys ?? []).includes(key)).map((rootKey) => (
        <Submenu key={rootKey} data={data} ownerKey={rootKey} onEvent={onEvent} onClose={() => onEvent({ type: 'expand', key: rootKey, expanded: false })} />
      ))}
    </div>
  )
}

function RootMenuItem({ itemKey, data, runtime, expanded }: { itemKey: string; data: PatternData; runtime: ReturnType<typeof createPatternRuntime>; expanded: boolean }) {
  const itemProps = runtime.getPartProps('menuitem', itemKey) as Props
  return (
    <button
      type="button"
      id={`menubar-${itemKey}`}
      {...itemProps}
      className="h-7 rounded px-2 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-expanded:bg-white aria-expanded:text-zinc-950 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:aria-expanded:bg-zinc-950 dark:aria-expanded:text-zinc-50 dark:focus:outline-zinc-500"
    >
      {data.items[itemKey]?.label}
      {(data.relations?.childrenByKey?.[itemKey]?.length ?? 0) > 0 ? <Icon name="chevron-right" className={`ml-1 text-xs text-zinc-500 ${expanded ? 'rotate-90' : ''}`} /> : null}
    </button>
  )
}

function Submenu({ data, ownerKey, onEvent, onClose }: { data: PatternData; ownerKey: string; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const radioGroup = children.filter((key) => (data.items[key] as { kind?: string } | undefined)?.kind === 'menuitemradio')
  return (
    <ul role="menu" aria-labelledby={`menubar-${ownerKey}`} className="ml-2 grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow dark:border-zinc-800 dark:bg-zinc-950" onKeyDown={(event) => {
      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        event.preventDefault()
        onClose()
      }
    }}>
      {children.map((key) => <SubmenuItem key={key} itemKey={key} data={data} radioGroup={radioGroup} onEvent={onEvent} onClose={onClose} />)}
    </ul>
  )
}

function SubmenuItem({ itemKey, data, radioGroup, onEvent, onClose }: { itemKey: string; data: PatternData; radioGroup: readonly string[]; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
  const item = data.items[itemKey] as { label?: string; kind?: string } | undefined
  const role = item?.kind === 'menuitemcheckbox' ? 'menuitemcheckbox' : item?.kind === 'menuitemradio' ? 'menuitemradio' : 'menuitem'
  const checked = data.state?.checkedByKey?.[itemKey]
  const disabled = data.state?.disabledKeys?.includes(itemKey)
  const activate = () => {
    if (disabled) return
    if (item?.kind === 'menuitemcheckbox') return onEvent({ type: 'check', key: itemKey, checked: !checked })
    if (item?.kind === 'menuitemradio') return radioGroup.forEach((key) => onEvent({ type: 'check', key, checked: key === itemKey }))
    onEvent({ type: 'activate', key: itemKey })
    onClose()
  }
  return (
    <li role={role} tabIndex={-1} aria-disabled={disabled || undefined} aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(checked) : undefined} onClick={activate} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate()
      }
    }} className="cursor-default rounded px-2 py-1 text-zinc-800 outline-none hover:bg-zinc-100 aria-disabled:text-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:aria-disabled:text-zinc-600">
      <span className="mr-2 inline-grid w-4 place-items-center text-xs text-zinc-500">
        {role === 'menuitemcheckbox' ? <Icon name={checked ? 'square-check' : 'square'} /> : null}
        {role === 'menuitemradio' ? <Icon name="circle-dot" className={checked ? '' : 'opacity-0'} /> : null}
      </span>
      {item?.label ?? itemKey}
    </li>
  )
}

function useTypeahead(data: PatternData, rootKeys: readonly string[], onEvent: (event: PatternEvent) => void) {
  const ref = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  return (char: string) => {
    const state = ref.current
    state.query += char.toLowerCase()
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)
    const start = data.state?.activeKey ? rootKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...rootKeys.slice(start + 1), ...rootKeys.slice(0, start + 1)]
    const match = ordered.find((key) => (data.items[key]?.label ?? '').toLowerCase().startsWith(state.query))
    if (match) onEvent({ type: 'focus', key: match })
  }
}

function handleMenubarKey(event: ReactKeyboardEvent, baseKeyDown: ((event: ReactKeyboardEvent) => void) | undefined, typeahead: (char: string) => void) {
  const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && /\S/.test(event.key)
  if (printable && event.key !== ' ') {
    event.preventDefault()
    typeahead(event.key)
    return
  }
  baseKeyDown?.(event)
}
