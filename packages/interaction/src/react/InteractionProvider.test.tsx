import { fireEvent, render, screen } from '@testing-library/react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { describe, expect, it } from 'vitest'
import type { InteractionOwner } from '../interactionOwnership'
import {
  InteractionProvider,
  useInteractionFocusGuardHandler,
  useInteractionKeyboardHandler,
  useInteractionOwner,
  useInteractionRegistry,
} from './index'

describe('interaction react adapter', () => {
  it('registers an active owner and routes keyboard events through context', () => {
    render(
      <InteractionProvider>
        <TreeKeyboardProbe />
      </InteractionProvider>,
    )

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' })

    expect(screen.getByRole('status', { name: 'Owner route' }).textContent).toBe('tree')
  })

  it('supports temporary owner restore through the keyboard hook', () => {
    render(
      <InteractionProvider>
        <TemporaryOwnerProbe />
      </InteractionProvider>,
    )

    const input = screen.getByRole('textbox', { name: 'Tree filter' })
    fireEvent.focus(input)
    expect(screen.getByRole('status', { name: 'Active owner' }).textContent).toBe('tree-filter')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByRole('status', { name: 'Active owner' }).textContent).toBe('tree')
    expect(screen.getByRole('status', { name: 'Restore route' }).textContent).toBe('temporary-owner-restore-requested')
  })

  it('reports focus guard decisions through a React focus handler', () => {
    render(
      <InteractionProvider>
        <FocusGuardProbe />
      </InteractionProvider>,
    )

    fireEvent.focus(screen.getByRole('region', { name: 'Tree scroll container' }))

    expect(screen.getByRole('status', { name: 'Focus guard action' }).textContent).toBe('restore-active-owner')
  })
})

function TreeKeyboardProbe() {
  const [ownerRoute, setOwnerRoute] = useState('none')
  const owner = useMemo<InteractionOwner>(() => ({
    id: 'tree',
    kind: 'pattern',
    ownsKey: (input) => input.key === 'ArrowDown',
  }), [])
  useInteractionOwner(owner, { active: true })
  const onKeyDown = useInteractionKeyboardHandler({
    onOwnerKey: ({ route }) => setOwnerRoute(route.ownerId ?? 'none'),
  })

  return (
    <div role="tree" tabIndex={0} onKeyDown={onKeyDown}>
      <output role="status" aria-label="Owner route">{ownerRoute}</output>
    </div>
  )
}

function TemporaryOwnerProbe() {
  const registry = useInteractionRegistry()
  const [activeOwner, setActiveOwner] = useState('none')
  const [restoreRoute, setRestoreRoute] = useState('none')
  const treeOwner = useMemo<InteractionOwner>(() => ({
    id: 'tree',
    kind: 'pattern',
    restoreTarget: { kind: 'active-cursor' },
  }), [])
  const inputOwner = useMemo<InteractionOwner>(() => ({
    id: 'tree-filter',
    kind: 'temporary-control',
    restoreKeys: (input) => input.key === 'Escape',
  }), [])
  useInteractionOwner(treeOwner, { active: true })
  useInteractionOwner(inputOwner)

  const routeKeyboard = useInteractionKeyboardHandler({
    releaseOnRestore: true,
    onRestoreKey: ({ route }) => setRestoreRoute(route.reason),
  })

  const handleFocus = () => {
    registry.activate('tree-filter')
    setActiveOwner(registry.getActiveOwner()?.id ?? 'none')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    routeKeyboard(event)
    setActiveOwner(registry.getActiveOwner()?.id ?? 'none')
  }

  return (
    <label>
      Tree filter
      <input aria-label="Tree filter" onFocus={handleFocus} onKeyDown={handleKeyDown} />
      <output role="status" aria-label="Active owner">{activeOwner}</output>
      <output role="status" aria-label="Restore route">{restoreRoute}</output>
    </label>
  )
}

function FocusGuardProbe() {
  const [action, setAction] = useState('none')
  const owner = useMemo<InteractionOwner>(() => ({
    id: 'tree',
    kind: 'pattern',
    restoreTarget: { kind: 'active-cursor' },
  }), [])
  useInteractionOwner(owner, { active: true })
  const onFocus = useInteractionFocusGuardHandler({
    onFocusGuard: (result) => setAction(result.action),
  })

  return (
    <div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Tree scroll container"
        style={{ overflowY: 'auto' }}
        onFocus={onFocus}
      />
      <output role="status" aria-label="Focus guard action">{action}</output>
    </div>
  )
}
