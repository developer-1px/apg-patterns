import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPatternRuntime, menuButtonDefinition, usePatternAutoFocus } from '../../../../src'
import { Icon } from '../../shared/Icon'
import type { MenuProps } from './menuTypes'

type Props = HTMLAttributes<HTMLElement>

export function MenuButton({ data, onEvent }: MenuProps) {
  const focusStrategy = data.state?.focusStrategy === 'ariaActiveDescendant' ? 'ariaActiveDescendant' : 'rovingTabIndex'
  const runtime = createPatternRuntime({
    definition: menuButtonDefinition,
    data,
    options: { focusStrategy },
    onEvent,
    keyToElementId: (key) => `mb-${key}`,
  })
  const triggerKey = data.relations?.rootKeys?.[0]
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] : undefined
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const menuItemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []
  usePatternAutoFocus(runtime, { enabled: expanded })

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
        <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded ? (
        <ul {...menuProps} tabIndex={focusStrategy === 'ariaActiveDescendant' ? 0 : -1} onKeyDown={(event: ReactKeyboardEvent) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onEvent({ type: 'expand', key: triggerKey, expanded: false })
            document.getElementById(`mb-${triggerKey}`)?.focus({ preventScroll: true })
            return
          }
          const nextKey = resolveMenuButtonKey(event.key, menuItemKeys, data.state?.activeKey)
          if (nextKey) {
            event.preventDefault()
            onEvent({ type: 'focus', key: nextKey })
            return
          }
          rootKeyDown(event as any)
        }} className="grid w-56 gap-0.5 rounded border border-zinc-200 bg-white p-1 text-sm shadow outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:outline-zinc-500">
          {menuItemKeys.map((key) => {
            const itemProps = runtime.getPartProps('menuitem', key) as Props
            const itemState = runtime.getItemState(key, 'menuitem')
            return (
              <li key={key} id={`mb-${key}`} {...itemProps} data-active={itemState.active ? '' : undefined} onFocus={() => onEvent({ type: 'focus', key })} onClick={(event) => {
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

function resolveMenuButtonKey(key: string, keys: readonly string[], activeKey: string | null | undefined) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (key === 'ArrowDown') return keys[Math.min(index + 1, keys.length - 1)]
  if (key === 'ArrowUp') return keys[index <= 0 ? 0 : index - 1]
  if (key === 'Home') return keys[0]
  if (key === 'End') return keys[keys.length - 1]
  return undefined
}
