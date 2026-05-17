import { useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPatternRuntime, menubarDefinition, usePatternEffects, type PatternData, type PatternEvent } from '../../../../src'
import { Icon } from '../../shared/Icon'
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

  usePatternEffects({ definition: menubarDefinition, data, keyToElementId: runtime.keyToElementId })

  return (
    <div className="grid gap-2">
      <div {...rootProps} onKeyDown={(event) => handleMenubarKey(event, rootProps.onKeyDown as ((event: ReactKeyboardEvent) => void) | undefined, typeahead)} className="flex items-center gap-0.5 rounded bg-zinc-50 px-1 py-1 outline-none dark:bg-zinc-900">
        {rootKeys.map((key) => (
          <RootMenuItem key={key} itemKey={key} data={data} runtime={runtime} expanded={(data.state?.expandedKeys ?? []).includes(key)} onEvent={onEvent} />
        ))}
      </div>
      {rootKeys.filter((key) => (data.state?.expandedKeys ?? []).includes(key)).map((rootKey) => (
        <Submenu key={rootKey} data={data} ownerKey={rootKey} rootKeys={rootKeys} onEvent={onEvent} />
      ))}
    </div>
  )
}

function RootMenuItem({ itemKey, data, runtime, expanded, onEvent }: { itemKey: string; data: PatternData; runtime: ReturnType<typeof createPatternRuntime>; expanded: boolean; onEvent: (event: PatternEvent) => void }) {
  const itemProps = runtime.getPartProps('menuitem', itemKey) as Props
  const children = data.relations?.childrenByKey?.[itemKey] ?? []
  return (
    <button
      type="button"
      id={`menubar-${itemKey}`}
      {...itemProps}
      onKeyDown={(event) => {
        if (event.key === 'ArrowUp' && children.length > 0) {
          event.preventDefault()
          onEvent({ type: 'expand', key: itemKey, expanded: true })
          onEvent({ type: 'focus', key: children[children.length - 1]!, meta: { reason: 'keyboard' } })
          return
        }
        ;(itemProps.onKeyDown as ((event: ReactKeyboardEvent) => void) | undefined)?.(event)
      }}
      className="h-7 rounded px-2 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-expanded:bg-white aria-expanded:text-zinc-950 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:aria-expanded:bg-zinc-950 dark:aria-expanded:text-zinc-50 dark:focus:outline-zinc-500"
    >
      {data.items[itemKey]?.label}
      {(data.relations?.childrenByKey?.[itemKey]?.length ?? 0) > 0 ? <Icon name="chevron-right" className={`ml-1 text-xs text-zinc-500 ${expanded ? 'rotate-90' : ''}`} /> : null}
    </button>
  )
}

function Submenu({ data, ownerKey, rootKeys, onEvent }: { data: PatternData; ownerKey: string; rootKeys: readonly string[]; onEvent: (event: PatternEvent) => void }) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const radioGroup = children.filter((key) => (data.items[key] as { kind?: string } | undefined)?.kind === 'menuitemradio')
  const activeKey = children.includes(data.state?.activeKey ?? '') ? data.state?.activeKey : children[0]
  const focusOwner = () => {
    onEvent({ type: 'focus', key: ownerKey, meta: { reason: 'keyboard' } })
    document.getElementById(`menubar-${ownerKey}`)?.focus({ preventScroll: true })
  }
  const close = () => onEvent({ type: 'expand', key: ownerKey, expanded: false })
  const focusChild = (key: string | undefined) => {
    if (key) onEvent({ type: 'focus', key, meta: { reason: 'keyboard' } })
  }
  const openSibling = (direction: 'next' | 'previous') => {
    const target = siblingKey(rootKeys, ownerKey, direction)
    if (!target) return
    close()
    onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
    const targetChildren = data.relations?.childrenByKey?.[target] ?? []
    if (targetChildren.length > 0) {
      onEvent({ type: 'expand', key: target, expanded: true })
      focusChild(targetChildren[0])
    }
  }
  return (
    <ul role="menu" aria-labelledby={`menubar-${ownerKey}`} className="ml-2 grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow dark:border-zinc-800 dark:bg-zinc-950" onKeyDown={(event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        focusOwner()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusChild(stepKey(children, activeKey, 1))
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusChild(stepKey(children, activeKey, -1))
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        focusChild(children[0])
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        focusChild(children[children.length - 1])
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        openSibling('next')
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        openSibling('previous')
      }
    }}>
      {children.map((key) => <SubmenuItem key={key} itemKey={key} data={data} active={key === activeKey} radioGroup={radioGroup} onEvent={onEvent} onClose={close} />)}
    </ul>
  )
}

function SubmenuItem({ itemKey, data, active, radioGroup, onEvent, onClose }: { itemKey: string; data: PatternData; active: boolean; radioGroup: readonly string[]; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
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
    <li id={`menubar-${itemKey}`} role={role} tabIndex={active ? 0 : -1} data-active={active ? '' : undefined} aria-disabled={disabled || undefined} aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(checked) : undefined} onFocus={() => onEvent({ type: 'focus', key: itemKey })} onClick={activate} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate()
      }
    }} className="cursor-default rounded px-2 py-1 text-zinc-800 outline-none hover:bg-zinc-100 aria-disabled:text-zinc-400 data-active:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:aria-disabled:text-zinc-600 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500">
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
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
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

function stepKey(keys: readonly string[], activeKey: string | null | undefined, delta: 1 | -1) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (index === -1) return keys[delta === 1 ? 0 : keys.length - 1]
  return keys[(index + delta + keys.length) % keys.length]
}

function siblingKey(keys: readonly string[], key: string, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}
