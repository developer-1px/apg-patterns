import { useLayoutEffect, useMemo, useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPatternRuntime, menuButtonDefinition, type PatternOptions } from '../../src'
import type { MenuProps } from './menuTypes'

type Props = HTMLAttributes<HTMLElement>

export function MenuButton({ data, onEvent, focusStrategy = 'rovingTabIndex' }: MenuProps) {
  const options = useMemo<PatternOptions>(() => ({ focusStrategy }), [focusStrategy])
  const runtime = useMemo(
    () => createPatternRuntime({ definition: menuButtonDefinition, data, options, onEvent, keyToElementId: (key) => `mb-${key}` }),
    [data, onEvent, options],
  )
  const triggerKey = data.relations?.rootKeys?.[0]
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] : undefined
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const menuItemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []
  const menuContainerRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    if (!expanded || focusStrategy !== 'rovingTabIndex') return
    const activeKey = data.state?.activeKey
    if (activeKey && menuItemKeys.includes(activeKey)) document.getElementById(`mb-${activeKey}`)?.focus({ preventScroll: true })
  }, [expanded, focusStrategy, data.state?.activeKey, menuItemKeys])

  useLayoutEffect(() => {
    if (expanded && focusStrategy === 'ariaActiveDescendant') menuContainerRef.current?.focus({ preventScroll: true })
  }, [expanded, focusStrategy])

  if (!triggerKey || !menuKey) return null
  const triggerProps = runtime.getPartProps('trigger', triggerKey) as Props
  const menuProps = runtime.getPartProps('menu', menuKey) as Props
  const rootKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-xs gap-2">
      <button type="button" id={`mb-${triggerKey}`} {...triggerProps} onKeyDown={(event) => {
        if (!expanded && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onEvent({ type: 'expand', key: triggerKey, expanded: true })
          if (menuItemKeys[0]) onEvent({ type: 'focus', key: menuItemKeys[0] })
        }
      }} className="inline-flex h-8 items-center justify-between rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500">
        <span>{data.items[triggerKey]?.label ?? 'Menu'}</span>
        <span aria-hidden="true" className="ml-3 text-xs text-zinc-500">{expanded ? '▾' : '▸'}</span>
      </button>
      {expanded ? (
        <ul ref={menuContainerRef} {...menuProps} tabIndex={focusStrategy === 'ariaActiveDescendant' ? 0 : -1} onKeyDown={(event: ReactKeyboardEvent) => {
          rootKeyDown(event as any)
          if (event.key === 'Escape') {
            event.preventDefault()
            onEvent({ type: 'expand', key: triggerKey, expanded: false })
            document.getElementById(`mb-${triggerKey}`)?.focus({ preventScroll: true })
          }
        }} className="grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:outline-zinc-500">
          {menuItemKeys.map((key) => {
            const itemProps = runtime.getPartProps('menuitem', key) as Props
            const itemState = runtime.getItemState(key, 'menuitem')
            return (
              <li key={key} id={`mb-${key}`} {...itemProps} data-active={itemState.active ? '' : undefined} onClick={(event) => {
                ;(itemProps.onClick as ((event: unknown) => void) | undefined)?.(event)
                onEvent({ type: 'expand', key: triggerKey, expanded: false })
                document.getElementById(`mb-${triggerKey}`)?.focus({ preventScroll: true })
              }} className="cursor-default rounded px-2 py-1 text-zinc-800 outline-none aria-disabled:text-zinc-400 data-active:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500">
                {data.items[key]?.label ?? key}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
