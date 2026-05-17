/**
 * Menu — visualizes 2 patterns (`menubar`, `menu-button`) across 5 W3C APG variants.
 *
 * Variants are switched by the parent (`menuVariants`); this component decides
 * which sub-renderer (Menubar vs MenuButton) to dispatch to based on `apgPattern`.
 *
 * Focus management:
 *   - rovingTabIndex   → element.focus() via useLayoutEffect (Menubar + 2 of 3 menu-buttons)
 *   - ariaActiveDescendant → focus stays on menu container; aria-activedescendant tracks active
 */
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  createPatternRuntime,
  menubarDefinition,
  menuButtonDefinition,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
} from '../../src'

type Props = HTMLAttributes<HTMLElement>

export interface MenuProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  apgPattern: 'menubar' | 'menu-button'
  focusStrategy?: 'rovingTabIndex' | 'ariaActiveDescendant'
}

export function Menu(props: MenuProps) {
  if (props.apgPattern === 'menubar') return <Menubar {...props} />
  return <MenuButton {...props} />
}

// ────────────────────────────────────────────────────────────────────────────
// Menubar (Editor + Navigation variants share this renderer)
// ────────────────────────────────────────────────────────────────────────────

function Menubar({ data, onEvent }: MenuProps) {
  const options = useMemo<PatternOptions>(
    () => ({ focusStrategy: 'rovingTabIndex', orientation: 'horizontal' }),
    [],
  )
  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: menubarDefinition,
        data,
        options,
        onEvent,
        keyToElementId: (key) => `menubar-${key}`,
      }),
    [data, onEvent, options],
  )

  // roving tab-index: move DOM focus to active root menuitem
  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return
    if (!(data.relations?.rootKeys ?? []).includes(activeKey)) return
    document.getElementById(`menubar-${activeKey}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey, data.relations?.rootKeys])

  // type-ahead: first-character search across root items
  const typeaheadRef = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  const rootKeys = data.relations?.rootKeys ?? []
  const onTypeahead = useCallback(
    (char: string) => {
      const st = typeaheadRef.current
      st.query += char.toLowerCase()
      if (st.timer !== null) window.clearTimeout(st.timer)
      st.timer = window.setTimeout(() => {
        st.query = ''
        st.timer = null
      }, 500)
      const q = st.query
      const start = data.state?.activeKey ? rootKeys.indexOf(data.state.activeKey) : -1
      const ordered = [...rootKeys.slice(start + 1), ...rootKeys.slice(0, start + 1)]
      const match = ordered.find((k) => (data.items[k]?.label ?? '').toLowerCase().startsWith(q))
      if (match) onEvent({ type: 'focus', key: match })
    },
    [data, onEvent, rootKeys],
  )

  const rootProps = runtime.getPartProps('menubar') as Props
  const baseKeyDown = rootProps.onKeyDown as ((e: ReactKeyboardEvent) => void) | undefined
  const handleKeyDown = (event: ReactKeyboardEvent) => {
    const printable =
      event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && /\S/.test(event.key)
    if (printable && event.key !== ' ') {
      event.preventDefault()
      onTypeahead(event.key)
      return
    }
    baseKeyDown?.(event)
  }

  const expandedKeys = data.state?.expandedKeys ?? []

  return (
    <div className="grid gap-2">
      <div
        {...rootProps}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-0.5 rounded bg-zinc-50 px-1 py-1 outline-none dark:bg-zinc-900"
      >
        {rootKeys.map((key) => {
          const itemProps = runtime.getPartProps('menuitem', key) as Props
          const expanded = expandedKeys.includes(key)
          return (
            <button
              key={key}
              type="button"
              id={`menubar-${key}`}
              {...itemProps}
              className="h-7 rounded px-2 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-expanded:bg-white aria-expanded:text-zinc-950 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:aria-expanded:bg-zinc-950 dark:aria-expanded:text-zinc-50 dark:focus:outline-zinc-500"
            >
              {data.items[key]?.label}
              {(data.relations?.childrenByKey?.[key]?.length ?? 0) > 0 ? (
                <span aria-hidden="true" className="ml-1 text-xs text-zinc-500">
                  {expanded ? '▾' : '▸'}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {/* Submenu popup — opens for the expanded root item, if any. */}
      {rootKeys
        .filter((k) => expandedKeys.includes(k))
        .map((rootKey) => (
          <Submenu
            key={rootKey}
            data={data}
            ownerKey={rootKey}
            onEvent={onEvent}
            onClose={() => onEvent({ type: 'expand', key: rootKey, expanded: false })}
          />
        ))}
    </div>
  )
}

function Submenu({
  data,
  ownerKey,
  onEvent,
  onClose,
}: {
  data: PatternData
  ownerKey: string
  onEvent: (event: PatternEvent) => void
  onClose: () => void
}) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const checkedByKey = data.state?.checkedByKey ?? {}
  const disabledKeys = data.state?.disabledKeys ?? []
  const radioGroup = useMemo(
    () => children.filter((k) => (data.items[k] as { kind?: string } | undefined)?.kind === 'menuitemradio'),
    [children, data.items],
  )

  return (
    <ul
      role="menu"
      aria-labelledby={`menubar-${ownerKey}`}
      className="ml-2 grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow dark:border-zinc-800 dark:bg-zinc-950"
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          event.preventDefault()
          onClose()
        }
      }}
    >
      {children.map((key) => {
        const item = data.items[key] as { label?: string; kind?: string } | undefined
        const kind = item?.kind
        const checked = checkedByKey[key]
        const disabled = disabledKeys.includes(key)
        const role =
          kind === 'menuitemcheckbox'
            ? 'menuitemcheckbox'
            : kind === 'menuitemradio'
              ? 'menuitemradio'
              : 'menuitem'
        const onActivate = () => {
          if (disabled) return
          if (kind === 'menuitemcheckbox') {
            onEvent({ type: 'check', key, checked: !checked })
            return
          }
          if (kind === 'menuitemradio') {
            const next: Record<string, boolean | 'mixed'> = {}
            for (const k of radioGroup) next[k] = false
            next[key] = true
            for (const [k, v] of Object.entries(next)) onEvent({ type: 'check', key: k, checked: v })
            return
          }
          onEvent({ type: 'activate', key })
          onClose()
        }
        return (
          <li
            key={key}
            role={role}
            tabIndex={-1}
            aria-disabled={disabled || undefined}
            aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(checked) : undefined}
            onClick={onActivate}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onActivate()
              }
            }}
            className="cursor-default rounded px-2 py-1 text-zinc-800 outline-none hover:bg-zinc-100 aria-disabled:text-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:aria-disabled:text-zinc-600"
          >
            <span className="mr-2 inline-block w-4 text-xs text-zinc-500">
              {role === 'menuitemcheckbox' ? (checked ? '☑' : '☐') : role === 'menuitemradio' ? (checked ? '●' : '○') : ''}
            </span>
            {item?.label ?? key}
          </li>
        )
      })}
    </ul>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Menu Button (Action menu — 3 sub-variants by focusStrategy)
// ────────────────────────────────────────────────────────────────────────────

function MenuButton({ data, onEvent, focusStrategy = 'rovingTabIndex' }: MenuProps) {
  const options = useMemo<PatternOptions>(() => ({ focusStrategy }), [focusStrategy])
  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: menuButtonDefinition,
        data,
        options,
        onEvent,
        keyToElementId: (key) => `mb-${key}`,
      }),
    [data, onEvent, options],
  )

  const triggerKey = data.relations?.rootKeys?.[0]
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] : undefined
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const menuItemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []

  // roving tab-index: move DOM focus to active menuitem when menu open
  useLayoutEffect(() => {
    if (!expanded || focusStrategy !== 'rovingTabIndex') return
    const activeKey = data.state?.activeKey
    if (!activeKey || !menuItemKeys.includes(activeKey)) return
    document.getElementById(`mb-${activeKey}`)?.focus({ preventScroll: true })
  }, [expanded, focusStrategy, data.state?.activeKey, menuItemKeys])

  // ariaActiveDescendant: focus the menu container itself when open
  const menuContainerRef = useRef<HTMLUListElement>(null)
  useLayoutEffect(() => {
    if (!expanded || focusStrategy !== 'ariaActiveDescendant') return
    menuContainerRef.current?.focus({ preventScroll: true })
  }, [expanded, focusStrategy])

  if (!triggerKey || !menuKey) return null

  const triggerProps = runtime.getPartProps('trigger', triggerKey) as Props
  const menuProps = runtime.getPartProps('menu', menuKey) as Props
  const rootKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-xs gap-2">
      <button
        type="button"
        id={`mb-${triggerKey}`}
        {...triggerProps}
        onKeyDown={(event: ReactKeyboardEvent) => {
          // ArrowDown / Enter / Space on closed trigger should open + focus first item.
          if (!expanded && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            onEvent({ type: 'expand', key: triggerKey, expanded: true })
            const first = menuItemKeys[0]
            if (first) onEvent({ type: 'focus', key: first })
          }
        }}
        className="inline-flex h-8 items-center justify-between rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500"
      >
        <span>{data.items[triggerKey]?.label ?? 'Menu'}</span>
        <span aria-hidden="true" className="ml-3 text-xs text-zinc-500">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded ? (
        <ul
          ref={menuContainerRef}
          {...menuProps}
          tabIndex={focusStrategy === 'ariaActiveDescendant' ? 0 : -1}
          onKeyDown={(event: ReactKeyboardEvent) => {
            // Route to runtime keyboard handler (Arrow / Home / End / Enter / Esc).
            rootKeyDown(event as any)
            if (event.key === 'Escape') {
              event.preventDefault()
              onEvent({ type: 'expand', key: triggerKey, expanded: false })
              document.getElementById(`mb-${triggerKey}`)?.focus({ preventScroll: true })
            }
          }}
          className="grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:outline-zinc-500"
        >
          {menuItemKeys.map((key) => {
            const itemProps = runtime.getPartProps('menuitem', key) as Props
            const itemState = runtime.getItemState(key, 'menuitem')
            return (
              <li
                key={key}
                id={`mb-${key}`}
                {...itemProps}
                data-active={itemState.active ? '' : undefined}
                onClick={(event) => {
                  ;(itemProps.onClick as ((e: any) => void) | undefined)?.(event)
                  onEvent({ type: 'expand', key: triggerKey, expanded: false })
                  document.getElementById(`mb-${triggerKey}`)?.focus({ preventScroll: true })
                }}
                className="cursor-default rounded px-2 py-1 text-zinc-800 outline-none aria-disabled:text-zinc-400 data-active:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
              >
                {data.items[key]?.label ?? key}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
