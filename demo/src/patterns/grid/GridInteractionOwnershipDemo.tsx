import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import {
  createInteractionOwnershipRegistry,
} from '../../../../packages/interaction/src/runtime'
import type { PatternData, PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import {
  commandPaletteShellOwner,
  commandPaletteTemporaryControl,
  handleDemoInteractionKeyboardEvent,
  isCommandPaletteShortcut,
} from '../shared/interactionDemoOwners'
import { Grid } from './Grid'
import { gridVariants, ownsGridDemoKey, reduceGridDemoData, reduceGridDemoKeyboardInput } from './gridData'

const gridOwnerId = 'grid'
const editorOwnerId = 'grid-cell-editor'
const shellOwnerId = 'command-palette'

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
      ownsKey: ownsGridDemoKey,
      allowsShellKey: isCommandPaletteShortcut,
      restore: () => {
        setActiveOwnerId(gridOwnerId)
        gridScopeRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"], [role="rowheader"][tabindex="0"]')?.focus()
      },
    })
    const unregisterEditor = registry.register(commandPaletteTemporaryControl({
      id: editorOwnerId,
      restore: ['Enter', 'Escape'],
      keys: { Tab: 'grid-editor.tab' },
    }))
    const unregisterShell = registry.register(commandPaletteShellOwner(shellOwnerId))

    registry.activate(gridOwnerId)

    return () => {
      unregisterShell()
      unregisterEditor()
      unregisterGrid()
    }
  }, [registry])

  const handleGridEvent = (event: PatternEvent) => {
    setData((current) => reduceGridDemoData(current, event))
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    if (event.target instanceof HTMLInputElement && event.target.hasAttribute('data-edit')) {
      registry.activate(editorOwnerId)
      setActiveOwnerId(editorOwnerId)
    }
  }

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    const result = handleDemoInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === gridOwnerId && input.targetKind !== 'pattern') {
          setData((current) => reduceGridDemoKeyboardInput(current, input))
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
