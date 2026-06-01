import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { InteractionKeyInput } from '../../../../packages/interaction/src/runtime'
import {
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
} from '../../../../packages/interaction/src/runtime'
import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Grid } from './Grid'
import { gridVariants } from './gridData'

const gridOwnerId = 'grid'
const editorOwnerId = 'grid-cell-editor'
const shellOwnerId = 'command-palette'

const gridKeys = new Set([
  'ArrowRight',
  'ArrowLeft',
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
  'PageDown',
  'PageUp',
  'Enter',
  'F2',
  'Escape',
])

export function GridInteractionOwnershipDemo() {
  const registry = useMemo(() => createInteractionOwnershipRegistry(), [])
  const gridScopeRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<PatternData>(gridVariants.dataEditable.data)
  const [activeOwnerId, setActiveOwnerId] = useState(gridOwnerId)
  const [routeReason, setRouteReason] = useState('none')
  const [commandCount, setCommandCount] = useState(0)

  useLayoutEffect(() => {
    const unregisterGrid = registry.register({
      id: gridOwnerId,
      kind: 'pattern',
      ownsKey: ownsGridKey,
      allowsShellKey: isCommandShortcut,
      restore: () => {
        setActiveOwnerId(gridOwnerId)
        gridScopeRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"]')?.focus()
      },
    })
    const unregisterEditor = registry.register({
      id: editorOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Enter' || input.key === 'Escape' || input.key === 'Tab',
      restoreKeys: (input) => input.key === 'Enter' || input.key === 'Escape',
      allowsShellKey: isCommandShortcut,
    })
    const unregisterShell = registry.register({
      id: shellOwnerId,
      kind: 'shell',
      ownsKey: isCommandShortcut,
    })

    registry.activate(gridOwnerId)

    return () => {
      unregisterShell()
      unregisterEditor()
      unregisterGrid()
    }
  }, [registry])

  const handleGridEvent = (event: PatternEvent) => {
    setData((current) => reducePatternData(gridDefinition, current, event))
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement && event.target.hasAttribute('data-edit')) {
      registry.activate(editorOwnerId)
      setActiveOwnerId(editorOwnerId)
    }
  }

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    const result = handleInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === gridOwnerId && input.targetKind !== 'pattern') {
          setData((current) => reduceGridKey(current, input))
        }
        if (route.ownerId === shellOwnerId) setCommandCount((current) => current + 1)
      },
    })

    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  return (
    <section className="grid gap-3" onFocusCapture={handleFocusCapture} onKeyDownCapture={handleKeyDownCapture}>
      <div ref={gridScopeRef}>
        <Grid data={data} onEvent={handleGridEvent} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div
          tabIndex={0}
          role="region"
          aria-label="Grid scroll container"
          data-interaction-scroll-container
          className={cx(ds.focusRing, 'max-h-16 overflow-y-auto rounded-md border border-zinc-200 p-2 text-sm dark:border-zinc-800')}
        >
          <div className="h-24">Scroll target</div>
        </div>
        <output role="status" aria-label="Grid active key">{data.state?.activeKey ?? 'none'}</output>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <output role="status" aria-label="Interaction owner">{activeOwnerId}</output>
        <output role="status" aria-label="Interaction route">{routeReason}</output>
        <output role="status" aria-label="Command count">{commandCount}</output>
      </div>
    </section>
  )
}

function reduceGridKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = gridKeyEvent(data, input)
  return event ? reducePatternData(gridDefinition, data, event) : data
}

function gridKeyEvent(data: PatternData, input: InteractionKeyInput): PatternEvent | null {
  const activeKey = data.state?.activeKey
  if (!activeKey) return null
  if (input.key === 'ArrowRight') return { type: 'navigate', direction: 'right', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowLeft') return { type: 'navigate', direction: 'left', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowDown') return { type: 'navigate', direction: 'down', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowUp') return { type: 'navigate', direction: 'up', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: input.ctrlKey ? 'gridStart' : 'rowStart', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: input.ctrlKey ? 'gridEnd' : 'rowEnd', meta: { reason: 'keyboard' } }
  if (input.key === 'PageDown') return { type: 'navigate', direction: 'pageDown', meta: { reason: 'keyboard' } }
  if (input.key === 'PageUp') return { type: 'navigate', direction: 'pageUp', meta: { reason: 'keyboard' } }
  if (input.key === 'Enter' || input.key === 'F2') return { type: 'activate', key: activeKey, meta: { reason: 'keyboard' } }
  if (input.key === 'Escape') return { type: 'dismiss', key: activeKey, meta: { reason: 'keyboard' } }
  return null
}

function ownsGridKey(input: InteractionKeyInput): boolean {
  return gridKeys.has(input.key)
}

function isCommandShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}
