import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { InteractionKeyInput } from '../../../../packages/interaction/src'
import {
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
} from '../../../../packages/interaction/src'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Listbox } from '../listbox/Listbox'
import { initialListboxData } from '../listbox/listboxData'

const dialogOwnerId = 'dialog'
const listboxOwnerId = 'dialog-listbox'
const searchOwnerId = 'dialog-search-input'
const shellOwnerId = 'command-palette'

const listboxKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '])

export function DialogInteractionOwnershipDemo() {
  const registry = useMemo(() => createInteractionOwnershipRegistry(), [])
  const listboxScopeRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [listboxData, setListboxData] = useState<PatternData>(initialListboxData)
  const [activeOwnerId, setActiveOwnerId] = useState('none')
  const [routeReason, setRouteReason] = useState('none')
  const [commandCount, setCommandCount] = useState(0)

  useLayoutEffect(() => {
    const unregisterDialog = registry.register({
      id: dialogOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Escape',
    })
    const unregisterListbox = registry.register({
      id: listboxOwnerId,
      kind: 'pattern',
      ownsKey: ownsListboxKey,
      allowsShellKey: isCommandShortcut,
      restore: () => {
        setActiveOwnerId(listboxOwnerId)
        listboxScopeRef.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus()
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

    return () => {
      unregisterShell()
      unregisterSearch()
      unregisterListbox()
      unregisterDialog()
    }
  }, [registry])

  const openDialog = () => {
    setOpen(true)
    registry.activate(dialogOwnerId)
    registry.activate(listboxOwnerId)
    setActiveOwnerId(listboxOwnerId)
  }

  const closeDialog = () => {
    setOpen(false)
    registry.release(registry.getActiveOwner()?.id ?? dialogOwnerId, 'cancel')
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  const handleListboxEvent = (event: PatternEvent) => {
    setListboxData((current) => reducePatternData(listboxDefinition, current, event))
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement) {
      registry.activate(searchOwnerId)
      setActiveOwnerId(searchOwnerId)
    }
  }

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    const result = handleInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === listboxOwnerId && input.targetKind !== 'pattern') {
          setListboxData((current) => reduceListboxKey(current, input))
        }
        if (route.ownerId === shellOwnerId) setCommandCount((current) => current + 1)
      },
    })

    if (result.route.ownerId === dialogOwnerId && result.route.status === 'restore') setOpen(false)
    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  return (
    <section className="grid gap-3">
      <button type="button" className={ds.button} onClick={openDialog}>Open dialog</button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Interaction ownership dialog"
          className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
          onFocusCapture={handleFocusCapture}
          onKeyDownCapture={handleKeyDownCapture}
        >
          <input
            type="text"
            aria-label="Dialog search"
            className={cx(ds.focusRing, 'rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950')}
          />
          <div ref={listboxScopeRef}>
            <Listbox data={listboxData} onEvent={handleListboxEvent} options={{ selectionMode: 'single', followFocus: true }} />
          </div>
          <div className="flex justify-end">
            <button type="button" className={ds.button} onClick={closeDialog}>Close</button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <output role="status" aria-label="Interaction owner">{activeOwnerId}</output>
            <output role="status" aria-label="Interaction route">{routeReason}</output>
            <output role="status" aria-label="Command count">{commandCount}</output>
          </div>
        </div>
      ) : null}
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

function ownsListboxKey(input: InteractionKeyInput): boolean {
  return listboxKeys.has(input.key)
}

function isCommandShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}
