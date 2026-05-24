import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import type { InteractionKeyInput } from '../../../../packages/interaction/src'
import {
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
} from '../../../../packages/interaction/src'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Toolbar } from '../toolbar/Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbar/toolbarData'
import { Listbox } from './Listbox'
import { initialListboxData } from './listboxData'

const listboxOwnerId = 'listbox'
const toolbarOwnerId = 'listbox-toolbar'
const searchOwnerId = 'listbox-filter-input'
const shellOwnerId = 'command-palette'

const listboxKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '])
const toolbarNavigationKeys = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End'])
const toolbarDelegatedListboxKeys = new Set(['ArrowDown', 'ArrowUp'])
const toolbarCommandKeys = new Set(['Enter', ' '])

export function ListboxToolbarInteractionOwnershipDemo() {
  const registry = useMemo(() => createInteractionOwnershipRegistry(), [])
  const listboxScopeRef = useRef<HTMLDivElement>(null)
  const [listboxData, setListboxData] = useState<PatternData>(initialListboxData)
  const [toolbarData, setToolbarData] = useState<PatternData>(initialToolbarData)
  const [activeOwnerId, setActiveOwnerId] = useState(listboxOwnerId)
  const [routeReason, setRouteReason] = useState('none')
  const [toolbarCommandCount, setToolbarCommandCount] = useState(0)
  const [shellCommandCount, setShellCommandCount] = useState(0)

  useLayoutEffect(() => {
    const unregisterListbox = registry.register({
      id: listboxOwnerId,
      kind: 'pattern',
      ownsKey: ownsListboxKey,
      allowsShellKey: isCommandShortcut,
      restore: () => {
        setActiveOwnerId(listboxOwnerId)
        focusActiveListboxOption(listboxScopeRef.current)
      },
    })
    const unregisterToolbar = registry.register({
      id: toolbarOwnerId,
      kind: 'pattern',
      ownsKey: ownsToolbarKey,
      allowsShellKey: isCommandShortcut,
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

    registry.activate(listboxOwnerId)

    return () => {
      unregisterShell()
      unregisterSearch()
      unregisterToolbar()
      unregisterListbox()
    }
  }, [registry])

  const handleListboxEvent = (event: PatternEvent) => {
    setListboxData((current) => reducePatternData(listboxDefinition, current, event))
  }

  const handleToolbarEvent = (event: PatternEvent) => {
    setToolbarData((current) => reduceToolbarData(current, event))
  }

  const handleToolbarClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest('button')) {
      setToolbarCommandCount((current) => current + 1)
    }
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement) {
      registry.activate(searchOwnerId)
      setActiveOwnerId(searchOwnerId)
      return
    }

    if (event.target instanceof HTMLElement && event.target.closest('[role="toolbar"]')) {
      registry.activate(toolbarOwnerId)
      setActiveOwnerId(toolbarOwnerId)
      return
    }

    if (event.target instanceof HTMLElement && event.target.closest('[role="listbox"]')) {
      registry.activate(listboxOwnerId)
      setActiveOwnerId(listboxOwnerId)
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
        if (route.ownerId === listboxOwnerId && input.targetKind !== 'pattern') {
          setListboxData((current) => reduceListboxKey(current, input))
        }

        if (route.ownerId === toolbarOwnerId) {
          if (input.key === 'Escape') {
            registry.activate(listboxOwnerId)
            setActiveOwnerId(listboxOwnerId)
            focusActiveListboxOption(listboxScopeRef.current)
          } else if (isToolbarNavigationKey(input)) {
            setToolbarData((current) => reduceToolbarKey(current, input))
          } else if (isToolbarCommandKey(input)) {
            setToolbarCommandCount((current) => current + 1)
          } else if (isToolbarDelegatedListboxKey(input)) {
            setListboxData((current) => reduceListboxKey(current, input))
            registry.activate(listboxOwnerId)
            setActiveOwnerId(listboxOwnerId)
          }
        }

        if (route.ownerId === shellOwnerId) setShellCommandCount((current) => current + 1)
      },
    })

    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  return (
    <section className="grid gap-3" onFocusCapture={handleFocusCapture} onKeyDownCapture={handleKeyDownCapture}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div ref={listboxScopeRef}>
          <Listbox data={listboxData} onEvent={handleListboxEvent} options={{ selectionMode: 'single', followFocus: true }} />
        </div>
        <div onClickCapture={handleToolbarClickCapture}>
          <Toolbar data={toolbarData} onEvent={handleToolbarEvent} />
        </div>
      </div>
      <label className="grid gap-1 text-sm">
        <span>Filter</span>
        <input
          type="text"
          aria-label="Listbox filter"
          className={cx(ds.focusRing, 'rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950')}
        />
      </label>
      <div className="grid grid-cols-4 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <output role="status" aria-label="Interaction owner">{activeOwnerId}</output>
        <output role="status" aria-label="Interaction route">{routeReason}</output>
        <output role="status" aria-label="Toolbar command count">{toolbarCommandCount}</output>
        <output role="status" aria-label="Shell command count">{shellCommandCount}</output>
      </div>
    </section>
  )
}

function reduceListboxKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = listboxKeyEvent(data, input)
  return event ? reducePatternData(listboxDefinition, data, event) : data
}

function listboxKeyEvent(data: PatternData, input: InteractionKeyInput): PatternEvent | null {
  const activeKey = data.state?.activeKey
  if (input.key === 'ArrowDown') return { type: 'navigate', direction: 'next', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowUp') return { type: 'navigate', direction: 'previous', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: 'first', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: 'last', meta: { reason: 'keyboard' } }
  if ((input.key === 'Enter' || input.key === ' ') && activeKey) {
    return { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey, meta: { reason: 'keyboard' } }
  }
  return null
}

function reduceToolbarKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = toolbarKeyEvent(input)
  return event ? reduceToolbarData(data, event) : data
}

function toolbarKeyEvent(input: InteractionKeyInput): PatternEvent | null {
  if (input.key === 'ArrowRight') return { type: 'navigate', direction: 'next', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowLeft') return { type: 'navigate', direction: 'previous', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: 'first', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: 'last', meta: { reason: 'keyboard' } }
  return null
}

function ownsListboxKey(input: InteractionKeyInput): boolean {
  return listboxKeys.has(input.key)
}

function ownsToolbarKey(input: InteractionKeyInput): boolean {
  return isToolbarNavigationKey(input)
    || isToolbarDelegatedListboxKey(input)
    || isToolbarCommandKey(input)
    || input.key === 'Escape'
}

function isToolbarNavigationKey(input: InteractionKeyInput): boolean {
  return toolbarNavigationKeys.has(input.key)
}

function isToolbarDelegatedListboxKey(input: InteractionKeyInput): boolean {
  return toolbarDelegatedListboxKeys.has(input.key)
}

function isToolbarCommandKey(input: InteractionKeyInput): boolean {
  return toolbarCommandKeys.has(input.key)
}

function isCommandShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}

function focusActiveListboxOption(scope: HTMLElement | null): void {
  scope?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus()
}
