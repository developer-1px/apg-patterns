import { useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type ReactNode } from 'react'
import type { InteractionFocusGuardAction, InteractionKeyInput, InteractionOwnerId } from '../../../../packages/interaction/src/runtime'
import {
  createInteractionOwnershipRegistry,
  evaluateInteractionFocusTarget,
  handleInteractionKeyboardEvent,
} from '../../../../packages/interaction/src/runtime'
import { gridDefinition, listboxDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Grid } from '../grid/Grid'
import { gridVariants } from '../grid/gridData'
import { Listbox } from '../listbox/Listbox'
import { initialListboxData } from '../listbox/listboxData'
import { Toolbar } from '../toolbar/Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbar/toolbarData'
import { Treeview } from './Treeview'
import { initialData as initialTreeData, reduceData as reduceTreeData, resolveTarget } from './treeContract'

const treeOwnerId = 'page-tree'
const listboxOwnerId = 'page-listbox'
const toolbarOwnerId = 'page-toolbar'
const gridOwnerId = 'page-grid'
const gridEditorOwnerId = 'page-grid-editor'
const searchOwnerId = 'page-search'
const dialogListboxOwnerId = 'page-dialog-listbox'
const dialogSearchOwnerId = 'page-dialog-search'
const shellOwnerId = 'page-shell'

const treeKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowRight', 'ArrowLeft', 'Enter', ' '])
const listboxKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '])
const dialogListboxKeys = new Set([...listboxKeys, 'Escape'])
const toolbarNavigationKeys = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End'])
const toolbarDelegatedListboxKeys = new Set(['ArrowDown', 'ArrowUp'])
const toolbarCommandKeys = new Set(['Enter', ' '])
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

type OwnerFocusId =
  | typeof treeOwnerId
  | typeof listboxOwnerId
  | typeof toolbarOwnerId
  | typeof gridOwnerId
  | typeof dialogListboxOwnerId

export function PageInteractionRecoveryDemo() {
  const registry = useMemo(() => createInteractionOwnershipRegistry(), [])
  const pageScopeRef = useRef<HTMLElement>(null)
  const treeScopeRef = useRef<HTMLDivElement>(null)
  const listboxScopeRef = useRef<HTMLDivElement>(null)
  const toolbarScopeRef = useRef<HTMLDivElement>(null)
  const gridScopeRef = useRef<HTMLDivElement>(null)
  const gridEditorInputRef = useRef<HTMLInputElement>(null)
  const dialogListboxScopeRef = useRef<HTMLDivElement>(null)
  const returnOwnerAfterDialogRef = useRef<OwnerFocusId>(treeOwnerId)
  const pendingRecoveryOwnerRef = useRef<OwnerFocusId | null>(null)
  const recoveringOwnerRef = useRef<OwnerFocusId | null>(null)
  const focusLockRef = useRef<{ ownerId: InteractionOwnerId; element: HTMLElement | null } | null>(null)

  const [treeData, setTreeData] = useState<PatternData>(initialTreeData)
  const [listboxData, setListboxData] = useState<PatternData>(initialListboxData)
  const [toolbarData, setToolbarData] = useState<PatternData>(initialToolbarData)
  const [gridData, setGridData] = useState<PatternData>(gridVariants.dataEditable.data)
  const [gridEditorOpen, setGridEditorOpen] = useState(false)
  const [gridEditorValue, setGridEditorValue] = useState('')
  const [dialogListboxData, setDialogListboxData] = useState<PatternData>(initialListboxData)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeOwnerId, setActiveOwnerId] = useState<InteractionOwnerId>(treeOwnerId)
  const [routeReason, setRouteReason] = useState('none')
  const [focusGuardAction, setFocusGuardAction] = useState<InteractionFocusGuardAction>('none')
  const [focusRecoveryCount, setFocusRecoveryCount] = useState(0)
  const [shellCommandCount, setShellCommandCount] = useState(0)
  const [customCommandCount, setCustomCommandCount] = useState(0)

  const recoverFocus = (ownerId: OwnerFocusId) => {
    lockFocus(ownerId, null)
    setActiveOwnerId(ownerId)
    setFocusRecoveryCount((current) => current + 1)
    pendingRecoveryOwnerRef.current = ownerId
  }

  const focusOwner = (ownerId: OwnerFocusId) => {
    if (ownerId === treeOwnerId) return focusActiveTreeItem(treeScopeRef.current)
    if (ownerId === listboxOwnerId) return focusActiveOption(listboxScopeRef.current)
    if (ownerId === toolbarOwnerId) return focusActiveToolbarItem(toolbarScopeRef.current)
    if (ownerId === gridOwnerId) return focusActiveGridCell(gridScopeRef.current)
    if (ownerId === dialogListboxOwnerId) return focusActiveOption(dialogListboxScopeRef.current)
    return null
  }

  const lockFocus = (ownerId: InteractionOwnerId, element: HTMLElement | null) => {
    const lock = { ownerId, element }
    focusLockRef.current = lock
    setTimeout(() => {
      if (focusLockRef.current === lock) focusLockRef.current = null
    }, 0)
    return lock
  }

  const restoreLockedFocus = (lock: { ownerId: InteractionOwnerId; element: HTMLElement | null }) => {
    queueMicrotask(() => {
      if (focusLockRef.current !== lock) return
      if (isOwnerFocusId(lock.ownerId)) {
        recoveringOwnerRef.current = lock.ownerId
        lock.element = lock.element ?? focusOwner(lock.ownerId)
        lock.element?.focus()
        recoveringOwnerRef.current = null
        return
      }
      lock.element?.focus()
    })
  }

  useLayoutEffect(() => {
    const unregisterTree = registry.register({
      id: treeOwnerId,
      kind: 'pattern',
      ownsKey: (input) => treeKeys.has(input.key),
      allowsShellKey: isGlobalShortcut,
      restoreTarget: { kind: 'active-cursor', label: 'Tree' },
      restore: () => recoverFocus(treeOwnerId),
    })
    const unregisterListbox = registry.register({
      id: listboxOwnerId,
      kind: 'pattern',
      ownsKey: (input) => listboxKeys.has(input.key),
      allowsShellKey: isGlobalShortcut,
      restoreTarget: { kind: 'active-cursor', label: 'Listbox' },
      restore: () => recoverFocus(listboxOwnerId),
    })
    const unregisterToolbar = registry.register({
      id: toolbarOwnerId,
      kind: 'pattern',
      ownsKey: ownsToolbarKey,
      allowsShellKey: isGlobalShortcut,
      restoreTarget: { kind: 'active-cursor', label: 'Toolbar' },
      restore: () => recoverFocus(toolbarOwnerId),
    })
    const unregisterGrid = registry.register({
      id: gridOwnerId,
      kind: 'pattern',
      ownsKey: (input) => gridKeys.has(input.key),
      allowsShellKey: isGlobalShortcut,
      restoreTarget: { kind: 'active-cursor', label: 'Grid cell' },
      restore: () => recoverFocus(gridOwnerId),
    })
    const unregisterGridEditor = registry.register({
      id: gridEditorOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Enter' || input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Enter' || input.key === 'Escape',
      allowsShellKey: isGlobalShortcut,
    })
    const unregisterSearch = registry.register({
      id: searchOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Escape',
      allowsShellKey: isGlobalShortcut,
    })
    const unregisterDialogListbox = registry.register({
      id: dialogListboxOwnerId,
      kind: 'pattern',
      ownsKey: (input) => dialogListboxKeys.has(input.key),
      allowsShellKey: isGlobalShortcut,
      restoreTarget: { kind: 'active-cursor', label: 'Dialog listbox' },
      restore: () => recoverFocus(dialogListboxOwnerId),
    })
    const unregisterDialogSearch = registry.register({
      id: dialogSearchOwnerId,
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Escape',
      allowsShellKey: isGlobalShortcut,
    })
    const unregisterShell = registry.register({
      id: shellOwnerId,
      kind: 'shell',
      ownsKey: isGlobalShortcut,
    })

    registry.activate(treeOwnerId)

    return () => {
      unregisterShell()
      unregisterDialogSearch()
      unregisterDialogListbox()
      unregisterSearch()
      unregisterGridEditor()
      unregisterGrid()
      unregisterToolbar()
      unregisterListbox()
      unregisterTree()
    }
  }, [registry])

  useLayoutEffect(() => {
    if (!dialogOpen) return
    registry.activate(dialogListboxOwnerId)
    setActiveOwnerId(dialogListboxOwnerId)
    recoverFocus(dialogListboxOwnerId)
  }, [dialogOpen, registry])

  useLayoutEffect(() => {
    if (!gridEditorOpen) return
    const input = gridEditorInputRef.current
    if (!input) return
    registry.activate(gridEditorOwnerId)
    setActiveOwnerId(gridEditorOwnerId)
    setFocusGuardAction('allow-native-focus')
    lockFocus(gridEditorOwnerId, input)
    input.focus()
  }, [gridEditorOpen, registry])

  useLayoutEffect(() => {
    const ownerId = pendingRecoveryOwnerRef.current
    if (!ownerId) return
    pendingRecoveryOwnerRef.current = null
    const lock = focusLockRef.current?.ownerId === ownerId ? focusLockRef.current : lockFocus(ownerId, null)
    recoveringOwnerRef.current = ownerId
    lock.element = focusOwner(ownerId)
    recoveringOwnerRef.current = null
  })

  const handleTreeEvent = (event: PatternEvent) => {
    setTreeData((current) => reduceTreeEvent(current, event))
  }

  const handleListboxEvent = (event: PatternEvent) => {
    setListboxData((current) => reducePatternData(listboxDefinition, current, event))
  }

  const handleDialogListboxEvent = (event: PatternEvent) => {
    setDialogListboxData((current) => reducePatternData(listboxDefinition, current, event))
  }

  const handleToolbarEvent = (event: PatternEvent) => {
    setToolbarData((current) => reduceToolbarData(current, event))
  }

  const handleGridEvent = (event: PatternEvent) => {
    setGridData((current) => reduceGridEvent(current, event))
  }

  const handleFocusCapture = (event: FocusEvent<HTMLElement>) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return

    const temporaryOwnerId = temporaryOwnerFromTarget(target)
    if (temporaryOwnerId) {
      registry.activate(temporaryOwnerId)
      setActiveOwnerId(temporaryOwnerId)
      setFocusGuardAction('allow-native-focus')
      lockFocus(temporaryOwnerId, target)
      return
    }

    const ownerId = ownerFromTarget(target)
    if (ownerId) {
      const lock = focusLockRef.current
      if (lock && lock.ownerId !== ownerId && registry.getOwner(lock.ownerId)) {
        registry.activate(lock.ownerId)
        setActiveOwnerId(lock.ownerId)
        restoreLockedFocus(lock)
        return
      }
      registry.activate(ownerId)
      setActiveOwnerId(ownerId)
      if (recoveringOwnerRef.current !== ownerId) setFocusGuardAction('none')
      return
    }

    const guard = evaluateInteractionFocusTarget(registry, target)
    setFocusGuardAction(guard.action)
    if (guard.action === 'restore-active-owner' && isOwnerFocusId(guard.activeOwnerId)) {
      recoverFocus(guard.activeOwnerId)
    }
  }

  const handleKeyDownCapture = (event: globalThis.KeyboardEvent) => {
    const result = handleInteractionKeyboardEvent({
      registry,
      event,
      releaseOnRestore: true,
      shouldStopPropagation: ({ route }) => route.status === 'owner' && route.ownerId !== shellOwnerId,
      onOwnerKey: ({ input, route }) => {
        if (route.ownerId === treeOwnerId) setTreeData((current) => reduceTreeKey(current, input))
        else if (route.ownerId === listboxOwnerId) setListboxData((current) => reduceListboxKey(current, input))
        else if (route.ownerId === toolbarOwnerId) handleToolbarOwnerKey(input)
        else if (route.ownerId === gridOwnerId) handleGridOwnerKey(input)
        else if (route.ownerId === dialogListboxOwnerId) handleDialogListboxOwnerKey(input)
        else if (route.ownerId === shellOwnerId) setShellCommandCount((current) => current + 1)
      },
      onRestoreKey: ({ route }) => {
        if (route.ownerId === gridEditorOwnerId) setGridEditorOpen(false)
      },
    })

    setRouteReason(result.route.reason)
    setActiveOwnerId(registry.getActiveOwner()?.id ?? 'none')
  }

  useLayoutEffect(() => {
    const scope = pageScopeRef.current
    if (!scope) return
    scope.addEventListener('keydown', handleKeyDownCapture, true)
    return () => scope.removeEventListener('keydown', handleKeyDownCapture, true)
  })

  const handleToolbarOwnerKey = (input: InteractionKeyInput) => {
    if (toolbarDelegatedListboxKeys.has(input.key)) {
      setListboxData((current) => reduceListboxKey(current, input))
      registry.activate(listboxOwnerId)
      recoverFocus(listboxOwnerId)
      return
    }
    if (toolbarCommandKeys.has(input.key)) {
      setCustomCommandCount((current) => current + 1)
      return
    }
    if (input.key === 'Escape') {
      registry.activate(listboxOwnerId)
      recoverFocus(listboxOwnerId)
      return
    }
    setToolbarData((current) => reduceToolbarKey(current, input))
  }

  const handleDialogListboxOwnerKey = (input: InteractionKeyInput) => {
    if (input.key === 'Escape') {
      closeDialog()
      return
    }
    setDialogListboxData((current) => reduceListboxKey(current, input))
  }

  const handleGridOwnerKey = (input: InteractionKeyInput) => {
    if (isGridEditorStartKey(gridData, input)) {
      const activeKey = String(gridData.state?.activeKey ?? '')
      setGridEditorValue(String(gridData.state?.valueByKey?.[activeKey] ?? gridData.items[activeKey]?.label ?? ''))
      setGridEditorOpen(true)
      return
    }
    setGridData((current) => reduceGridKey(current, input))
  }

  const openDialog = () => {
    const currentOwnerId = registry.getActiveOwner()?.id
    if (isOwnerFocusId(currentOwnerId)) returnOwnerAfterDialogRef.current = currentOwnerId
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    const nextOwnerId = returnOwnerAfterDialogRef.current
    registry.activate(nextOwnerId)
    recoverFocus(nextOwnerId)
  }

  return (
    <section ref={pageScopeRef} className="grid gap-3" onFocus={handleFocusCapture}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-3">
          <Surface label="Tree">
            <div ref={treeScopeRef} data-page-owner={treeOwnerId}>
              <Treeview data={treeData} onEvent={handleTreeEvent} options={{ elementIdPrefix: 'page-treeitem-' }} />
            </div>
          </Surface>
          <Surface label="List + toolbar">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div ref={listboxScopeRef} data-page-owner={listboxOwnerId}>
                <Listbox data={listboxData} onEvent={handleListboxEvent} options={{ selectionMode: 'single', followFocus: true }} />
              </div>
              <div ref={toolbarScopeRef} data-page-owner={toolbarOwnerId}>
                <Toolbar data={toolbarData} onEvent={handleToolbarEvent} />
              </div>
            </div>
          </Surface>
        </div>

        <div className="grid gap-3">
          <Surface label="Search + grid">
            <label className="grid gap-1 text-sm">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Search</span>
              <input
                type="search"
                aria-label="Page search"
                data-page-temp-owner={searchOwnerId}
                className={ds.field}
              />
            </label>
            <div ref={gridScopeRef} data-page-owner={gridOwnerId}>
              <Grid data={gridData} onEvent={handleGridEvent} />
            </div>
            {gridEditorOpen ? (
              <input
                ref={gridEditorInputRef}
                type="text"
                aria-label="Grid cell editor"
                data-page-temp-owner={gridEditorOwnerId}
                value={gridEditorValue}
                onChange={(event) => setGridEditorValue(event.currentTarget.value)}
                className={ds.field}
              />
            ) : null}
          </Surface>

          <Surface label="Recovery targets">
            <div className="grid gap-2 sm:grid-cols-3">
              <div
                tabIndex={0}
                role="region"
                aria-label="Page scroll recovery target"
                data-interaction-scroll-container
                className={cx(ds.focusRing, 'max-h-16 overflow-y-auto rounded-md border border-zinc-200 p-2 text-sm dark:border-white/10')}
              >
                <div className="h-24">Scroll target</div>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label="Page incidental recovery target"
                className={cx(ds.focusRing, 'rounded-md border border-zinc-200 p-2 text-sm dark:border-white/10')}
              >
                Incidental target
              </div>
              <button type="button" className={ds.button} onClick={openDialog}>Open modal</button>
            </div>
          </Surface>
        </div>
      </div>

      {dialogOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Page recovery modal"
          className="grid gap-3 rounded-md border border-zinc-200 p-3 dark:border-white/10"
        >
          <input
            type="search"
            aria-label="Modal search"
            data-page-temp-owner={dialogSearchOwnerId}
            className={ds.field}
          />
          <div ref={dialogListboxScopeRef} data-page-owner={dialogListboxOwnerId}>
            <Listbox data={dialogListboxData} onEvent={handleDialogListboxEvent} options={{ selectionMode: 'single', followFocus: true }} />
          </div>
          <div className="flex justify-end">
            <button type="button" className={ds.button} onClick={closeDialog}>Close</button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:grid-cols-5">
        <Status label="Interaction owner" value={activeOwnerId} />
        <Status label="Interaction route" value={routeReason} />
        <Status label="Focus guard action" value={focusGuardAction} />
        <Status label="Focus recovery count" value={focusRecoveryCount} />
        <Status label="Shell command count" value={shellCommandCount} />
      </div>
      <output role="status" aria-label="Custom command count" className="sr-only">{customCommandCount}</output>
    </section>
  )
}

function Surface({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid gap-2 rounded-md border border-zinc-200 p-2 dark:border-white/10" aria-label={label}>
      <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</h3>
      {children}
    </section>
  )
}

function Status({ label, value }: { label: string; value: string | number }) {
  return (
    <label className="grid gap-1 rounded-md border border-zinc-200 px-2 py-1 dark:border-white/10">
      <span className="truncate text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-500">{label.replace('Interaction ', '')}</span>
      <output role="status" aria-label={label} className="truncate text-zinc-800 dark:text-zinc-200">{value}</output>
    </label>
  )
}

function reduceTreeEvent(data: PatternData, event: PatternEvent): PatternData {
  if (event.type !== 'navigate') return reduceTreeData(data, event)
  const target = resolveTarget(event.direction, data)
  return target ? reduceTreeData(data, { type: 'focus', key: target, meta: event.meta }) : data
}

function reduceTreeKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const direction = treeDirection(input.key)
  if (!direction) return data
  const target = resolveTarget(direction, data)
  return target ? reduceTreeData(data, { type: 'focus', key: target, meta: { reason: 'keyboard' } }) : data
}

function treeDirection(key: string): Extract<PatternEvent, { type: 'navigate' }>['direction'] | null {
  if (key === 'ArrowDown') return 'next'
  if (key === 'ArrowUp') return 'previous'
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
  if (key === 'ArrowRight') return 'child'
  if (key === 'ArrowLeft') return 'parent'
  return null
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

function reduceGridEvent(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'sort') {
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key]: event.sort } } }
  }
  return reducePatternData(gridDefinition, data, event)
}

function reduceGridKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = gridKeyEvent(data, input)
  return event ? reduceGridEvent(data, event) : data
}

function isGridEditorStartKey(data: PatternData, input: InteractionKeyInput): boolean {
  const activeKey = data.state?.activeKey
  return Boolean(
    activeKey
    && (input.key === 'Enter' || input.key === 'F2')
    && (data.state?.editableKeys as readonly string[] | undefined)?.includes(activeKey),
  )
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
  if (input.key === 'Enter' || input.key === 'F2') {
    if (data.items[activeKey]?.kind === 'columnheader') return { type: 'sort', key: activeKey, sort: nextSort(data.state?.sortByKey?.[activeKey]) }
    if ((data.state?.editableKeys as readonly string[] | undefined)?.includes(activeKey)) {
      const value = String(data.state?.valueByKey?.[activeKey] ?? data.items[activeKey]?.label ?? '')
      return { type: 'editStart', key: activeKey, value, meta: { reason: 'keyboard' } }
    }
    return { type: 'activate', key: activeKey, meta: { reason: 'keyboard' } }
  }
  if (input.key === 'Escape') return { type: 'editEnd', key: activeKey, meta: { reason: 'keyboard' } }
  return null
}

function nextSort(current: unknown): 'ascending' | 'descending' {
  return current === 'ascending' ? 'descending' : 'ascending'
}

function ownsToolbarKey(input: InteractionKeyInput): boolean {
  return toolbarNavigationKeys.has(input.key)
    || toolbarDelegatedListboxKeys.has(input.key)
    || toolbarCommandKeys.has(input.key)
    || input.key === 'Escape'
}

function temporaryOwnerFromTarget(target: HTMLElement): InteractionOwnerId | null {
  if (target instanceof HTMLInputElement && target.hasAttribute('data-edit')) return gridEditorOwnerId
  return target.closest<HTMLElement>('[data-page-temp-owner]')?.dataset.pageTempOwner ?? null
}

function ownerFromTarget(target: HTMLElement): OwnerFocusId | null {
  const ownerId = target.closest<HTMLElement>('[data-page-owner]')?.dataset.pageOwner
  return isOwnerFocusId(ownerId) ? ownerId : null
}

function isOwnerFocusId(ownerId: unknown): ownerId is OwnerFocusId {
  return ownerId === treeOwnerId
    || ownerId === listboxOwnerId
    || ownerId === toolbarOwnerId
    || ownerId === gridOwnerId
    || ownerId === dialogListboxOwnerId
}

function isGlobalShortcut(input: InteractionKeyInput): boolean {
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}

function focusActiveTreeItem(scope: HTMLElement | null): HTMLElement | null {
  return focusElement(scope?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]') ?? null)
}

function focusActiveOption(scope: HTMLElement | null): HTMLElement | null {
  return focusElement(scope?.querySelector<HTMLElement>('[role="option"][tabindex="0"]') ?? null)
}

function focusActiveToolbarItem(scope: HTMLElement | null): HTMLElement | null {
  return focusElement(scope?.querySelector<HTMLElement>('[role="toolbar"] [tabindex="0"]') ?? null)
}

function focusActiveGridCell(scope: HTMLElement | null): HTMLElement | null {
  return focusElement(scope?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"]') ?? null)
}

function focusElement(element: HTMLElement | null): HTMLElement | null {
  element?.focus()
  return element
}
