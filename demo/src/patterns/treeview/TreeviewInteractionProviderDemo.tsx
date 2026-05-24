import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { InteractionKeyInput, InteractionOwner } from '../../../../packages/interaction/src'
import {
  InteractionProvider,
  useInteractionFocusGuardHandler,
  useInteractionKeyboardHandler,
  useInteractionOwner,
  useInteractionRegistry,
} from '../../../../packages/interaction/src/react'
import type { PatternData, PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Treeview } from './Treeview'
import { initialData, reduceData, resolveTarget } from './treeContract'

const treeOwnerId = 'treeview'
const inputOwnerId = 'tree-filter-input'
const shellOwnerId = 'command-palette'

const treeKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End'])

export function TreeviewInteractionProviderDemo() {
  return (
    <InteractionProvider>
      <TreeviewInteractionProviderDemoInner />
    </InteractionProvider>
  )
}

function TreeviewInteractionProviderDemoInner() {
  const registry = useInteractionRegistry()
  const treeScopeRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<PatternData>(initialData)
  const [activeOwnerId, setActiveOwnerId] = useState(treeOwnerId)
  const [routeReason, setRouteReason] = useState('none')
  const [focusGuardAction, setFocusGuardAction] = useState('none')
  const [commandCount, setCommandCount] = useState(0)

  const treeOwner = useMemo<InteractionOwner>(() => ({
    id: treeOwnerId,
    kind: 'pattern',
    ownsKey: ownsTreeKey,
    allowsShellKey: isCommandShortcut,
    restoreTarget: { kind: 'active-cursor' },
    restore: () => {
      setActiveOwnerId(treeOwnerId)
      focusActiveTreeItem(treeScopeRef.current)
    },
  }), [])
  const inputOwner = useMemo<InteractionOwner>(() => ({
    id: inputOwnerId,
    kind: 'temporary-control',
    ownsKey: (input) => input.key === 'Escape',
    restoreKeys: (input) => input.key === 'Escape',
    allowsShellKey: isCommandShortcut,
  }), [])
  const shellOwner = useMemo<InteractionOwner>(() => ({
    id: shellOwnerId,
    kind: 'shell',
    ownsKey: isCommandShortcut,
  }), [])

  useInteractionOwner(treeOwner, { active: true })
  useInteractionOwner(inputOwner)
  useInteractionOwner(shellOwner)

  const handleTreeEvent = (event: PatternEvent) => {
    setData((current) => reduceTreeDemoData(current, event))
  }

  const routeKeyboard = useInteractionKeyboardHandler({
    releaseOnRestore: true,
    shouldStopPropagation: ({ input, route }) => (
      route.status === 'restore'
      || (route.status === 'owner' && input.targetKind !== 'pattern')
    ),
    onOwnerKey: ({ input, route }) => {
      if (route.ownerId === treeOwnerId && input.targetKind !== 'pattern') {
        setData((current) => reduceTreeKey(current, input))
      }
      if (route.ownerId === shellOwnerId) setCommandCount((current) => current + 1)
    },
  })

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const result = routeKeyboard(event)
    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  const handleScrollContainerFocus = useInteractionFocusGuardHandler({
    onFocusGuard: (result) => {
      setFocusGuardAction(result.action)
      if (result.action === 'restore-active-owner') {
        focusActiveTreeItem(treeScopeRef.current)
      }
    },
  })

  const handleInputFocus = () => {
    registry.activate(inputOwnerId)
    setActiveOwnerId(inputOwnerId)
  }

  return (
    <section className="grid gap-3" onKeyDown={handleKeyDown}>
      <div ref={treeScopeRef}>
        <Treeview data={data} onEvent={handleTreeEvent} options={{ elementIdPrefix: 'provider-treeitem-' }} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div
          tabIndex={0}
          role="region"
          aria-label="Provider tree scroll container"
          data-interaction-scroll-container
          onFocus={handleScrollContainerFocus}
          className={cx(ds.focusRing, 'max-h-16 overflow-y-auto rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800')}
        >
          <div className="h-24">Scroll target</div>
        </div>
        <label className="grid gap-1 text-sm">
          <span>Filter</span>
          <input
            type="text"
            aria-label="Provider tree filter"
            onFocus={handleInputFocus}
            className={cx(ds.focusRing, 'rounded-md border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950')}
          />
        </label>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <output role="status" aria-label="Interaction owner">{activeOwnerId}</output>
        <output role="status" aria-label="Interaction route">{routeReason}</output>
        <output role="status" aria-label="Focus guard action">{focusGuardAction}</output>
        <output role="status" aria-label="Command count">{commandCount}</output>
      </div>
    </section>
  )
}

function reduceTreeDemoData(data: PatternData, event: PatternEvent): PatternData {
  if (event.type !== 'navigate') return reduceData(data, event)
  const target = resolveTarget(event.direction, data)
  return target ? reduceData(data, { type: 'focus', key: target, meta: event.meta }) : data
}

function reduceTreeKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const direction = treeDirection(input.key)
  if (!direction) return data
  const target = resolveTarget(direction, data)
  return target ? reduceData(data, { type: 'focus', key: target, meta: { reason: 'keyboard' } }) : data
}

function treeDirection(key: string): Extract<PatternEvent, { type: 'navigate' }>['direction'] | null {
  if (key === 'ArrowDown') return 'next'
  if (key === 'ArrowUp') return 'previous'
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
  return null
}

function ownsTreeKey(input: InteractionKeyInput): boolean {
  return treeKeys.has(input.key)
}

function isCommandShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}

function focusActiveTreeItem(scope: HTMLElement | null): void {
  scope?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus()
}
