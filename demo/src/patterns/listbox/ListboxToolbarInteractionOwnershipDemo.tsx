import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import {
  createInteractionOwnershipRegistry,
} from '../../../../packages/interaction/src/runtime'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import {
  commandPaletteShellOwner,
  commandPaletteTemporaryControl,
  getDemoToolbarKeyIntent,
  handleDemoInteractionKeyboardEvent,
  isCommandPaletteShortcut,
  ownsDemoListboxKey,
  ownsDemoToolbarKey,
  reduceDemoListboxKey,
  reduceDemoToolbarKey,
} from '../shared/interactionDemoOwners'
import { Toolbar } from '../toolbar/Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbar/toolbarData'
import { Listbox } from './Listbox'
import { initialListboxData } from './listboxData'

const listboxOwnerId = 'listbox'
const toolbarOwnerId = 'listbox-toolbar'
const searchOwnerId = 'listbox-filter-input'
const shellOwnerId = 'command-palette'

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
      ownsKey: ownsDemoListboxKey,
      allowsShellKey: isCommandPaletteShortcut,
      restore: () => {
        setActiveOwnerId(listboxOwnerId)
        focusActiveListboxOption(listboxScopeRef.current)
      },
    })
    const unregisterToolbar = registry.register({
      id: toolbarOwnerId,
      kind: 'pattern',
      ownsKey: ownsDemoToolbarKey,
      allowsShellKey: isCommandPaletteShortcut,
    })
    const unregisterSearch = registry.register(commandPaletteTemporaryControl({
      id: searchOwnerId,
      restore: ['Escape'],
    }))
    const unregisterShell = registry.register(commandPaletteShellOwner(shellOwnerId))

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
    const result = handleDemoInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      shouldStopPropagation: ({ input, route }) => (
        route.status === 'restore'
        || (route.status === 'owner' && route.ownerId !== shellOwnerId && input.targetKind !== 'pattern')
      ),
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === listboxOwnerId && input.targetKind !== 'pattern') {
          setListboxData((current) => reduceDemoListboxKey(current, input))
        }

        if (route.ownerId === toolbarOwnerId) {
          const toolbarIntent = getDemoToolbarKeyIntent(input)
          if (toolbarIntent === 'restore-listbox') {
            registry.activate(listboxOwnerId)
            setActiveOwnerId(listboxOwnerId)
            focusActiveListboxOption(listboxScopeRef.current)
          } else if (toolbarIntent === 'navigation') {
            setToolbarData((current) => reduceDemoToolbarKey(current, input))
          } else if (toolbarIntent === 'command') {
            setToolbarCommandCount((current) => current + 1)
          } else if (toolbarIntent === 'delegate-listbox') {
            setListboxData((current) => reduceDemoListboxKey(current, input))
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

function focusActiveListboxOption(scope: HTMLElement | null): void {
  scope?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus()
}
