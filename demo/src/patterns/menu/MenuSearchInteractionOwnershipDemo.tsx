import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { InteractionKeyInput } from '../../../../packages/interaction/src'
import {
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
} from '../../../../packages/interaction/src'
import { menuButtonDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Menu } from './Menu'
import { menuVariants } from './menuData'

const menuOwnerId = 'menu'
const searchOwnerId = 'menu-search-input'
const shellOwnerId = 'command-palette'

const menuKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' ', 'Escape'])

const actionMenu = menuVariants.actionMenuButton
const initialMenuData: PatternData = {
  ...actionMenu.data,
  state: {
    ...actionMenu.data.state,
    apgPattern: actionMenu.apgPattern,
    focusStrategy: actionMenu.focusStrategy,
  },
}

export function MenuSearchInteractionOwnershipDemo() {
  const registry = useMemo(() => createInteractionOwnershipRegistry(), [])
  const menuScopeRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<PatternData>(initialMenuData)
  const [activeOwnerId, setActiveOwnerId] = useState(menuOwnerId)
  const [routeReason, setRouteReason] = useState('none')
  const [commandCount, setCommandCount] = useState(0)

  useLayoutEffect(() => {
    const unregisterMenu = registry.register({
      id: menuOwnerId,
      kind: 'pattern',
      ownsKey: ownsMenuKey,
      allowsShellKey: isCommandShortcut,
      restore: () => {
        setActiveOwnerId(menuOwnerId)
        focusActiveMenuTarget(menuScopeRef.current)
      },
    })
    const unregisterSearch = registry.register({
      id: searchOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Escape',
      allowsShellKey: isCommandShortcut,
    })
    const unregisterShell = registry.register({
      id: shellOwnerId,
      kind: 'shell',
      ownsKey: isCommandShortcut,
    })

    registry.activate(menuOwnerId)

    return () => {
      unregisterShell()
      unregisterSearch()
      unregisterMenu()
    }
  }, [registry])

  const handleMenuEvent = (event: PatternEvent) => {
    setData((current) => reduceMenuData(current, event))
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement) {
      registry.activate(searchOwnerId)
      setActiveOwnerId(searchOwnerId)
      return
    }

    if (event.target instanceof HTMLElement && event.target.closest('[role="menu"], [role="menuitem"], button[aria-haspopup="menu"]')) {
      registry.activate(menuOwnerId)
      setActiveOwnerId(menuOwnerId)
    }
  }

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    const result = handleInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      shouldStopPropagation: ({ input, route }) => (
        route.status === 'restore'
        || (route.status === 'owner' && route.ownerId !== shellOwnerId && input.targetKind !== 'pattern')
      ),
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === menuOwnerId && input.targetKind !== 'pattern') {
          setData((current) => reduceMenuKey(current, input))
        }
        if (route.ownerId === shellOwnerId) setCommandCount((current) => current + 1)
      },
    })

    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  return (
    <section className="grid gap-3" onFocusCapture={handleFocusCapture} onKeyDownCapture={handleKeyDownCapture}>
      <div ref={menuScopeRef}>
        <Menu data={data} onEvent={handleMenuEvent} />
      </div>
      <label className="grid gap-1 text-sm">
        <span>Search</span>
        <input
          type="search"
          aria-label="Menu search"
          className={cx(ds.focusRing, 'rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950')}
        />
      </label>
      <div className="grid grid-cols-3 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <output role="status" aria-label="Interaction owner">{activeOwnerId}</output>
        <output role="status" aria-label="Interaction route">{routeReason}</output>
        <output role="status" aria-label="Command count">{commandCount}</output>
      </div>
    </section>
  )
}

function reduceMenuData(data: PatternData, event: PatternEvent): PatternData {
  const next = reducePatternData(menuButtonDefinition, data, event)
  return {
    ...next,
    state: {
      ...next.state,
      apgPattern: actionMenu.apgPattern,
      focusStrategy: actionMenu.focusStrategy,
    },
  }
}

function reduceMenuKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const events = menuKeyEvents(data, input)
  return events.reduce((current, event) => reduceMenuData(current, event), data)
}

function menuKeyEvents(data: PatternData, input: InteractionKeyInput): PatternEvent[] {
  const triggerKey = data.relations?.rootKeys?.[0]
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] : undefined
  const itemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) === true : false
  const activeKey = typeof data.state?.activeKey === 'string' ? data.state.activeKey : itemKeys[0]

  if (!triggerKey || itemKeys.length === 0) return []

  if (!expanded) {
    if (input.key === 'ArrowDown' || input.key === 'Enter' || input.key === ' ') {
      return openMenuEvents(triggerKey, itemKeys[0]!)
    }
    if (input.key === 'ArrowUp') {
      return openMenuEvents(triggerKey, itemKeys[itemKeys.length - 1]!)
    }
    return []
  }

  const nextKey = resolveMenuKey(input.key, itemKeys, activeKey)
  if (nextKey) return [{ type: 'focus', key: nextKey, meta: { reason: 'keyboard' } }]

  if ((input.key === 'Enter' || input.key === ' ') && activeKey) {
    return [{ type: 'activate', key: activeKey }, { type: 'dismiss', meta: { reason: 'keyboard' } }]
  }
  if (input.key === 'Escape') return [{ type: 'dismiss', meta: { reason: 'keyboard' } }]

  return []
}

function openMenuEvents(triggerKey: string, activeKey: string): PatternEvent[] {
  return [
    { type: 'expand', key: triggerKey, expanded: true, meta: { reason: 'open' } },
    { type: 'focus', key: activeKey, meta: { reason: 'open' } },
  ]
}

function resolveMenuKey(key: string, itemKeys: readonly string[], activeKey: string | undefined): string | null {
  const index = activeKey ? itemKeys.indexOf(activeKey) : -1
  if (key === 'ArrowDown') return itemKeys[(index + 1 + itemKeys.length) % itemKeys.length] ?? null
  if (key === 'ArrowUp') return itemKeys[(index - 1 + itemKeys.length) % itemKeys.length] ?? null
  if (key === 'Home') return itemKeys[0] ?? null
  if (key === 'End') return itemKeys[itemKeys.length - 1] ?? null
  return null
}

function ownsMenuKey(input: InteractionKeyInput): boolean {
  return menuKeys.has(input.key)
}

function isCommandShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}

function focusActiveMenuTarget(scope: HTMLElement | null): void {
  const activeItem = scope?.querySelector<HTMLElement>('[role="menuitem"][tabindex="0"]')
  if (activeItem) {
    activeItem.focus()
    return
  }
  scope?.querySelector<HTMLElement>('button[aria-haspopup="menu"]')?.focus()
}
