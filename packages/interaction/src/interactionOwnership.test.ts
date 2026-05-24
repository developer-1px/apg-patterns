import { describe, expect, it, vi } from 'vitest'

import { createInteractionOwnershipRegistry } from './interactionOwnership'

describe('interaction ownership registry', () => {
  it('routes keys only to the active owner that accepts them', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowUp' || input.key === 'ArrowDown',
    })
    registry.activate('tree')

    expect(registry.resolveOwnerForKey({ key: 'ArrowDown' })?.id).toBe('tree')
    expect(registry.resolveOwnerForKey({ key: 'Enter' })).toBeNull()
  })

  it('restores a pattern owner after a temporary control releases ownership', () => {
    const registry = createInteractionOwnershipRegistry()
    const restoreTree = vi.fn()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor' },
      restore: restoreTree,
    })
    registry.register({ id: 'tree-filter-input', kind: 'temporary-control' })

    registry.activate('tree')
    registry.activate('tree-filter-input')

    expect(registry.snapshot()).toEqual({
      activeOwnerId: 'tree-filter-input',
      ownerIds: ['tree', 'tree-filter-input'],
      returnOwnerIds: ['tree'],
      restoreTarget: null,
    })

    expect(registry.release('tree-filter-input')?.id).toBe('tree')
    expect(registry.getActiveOwner()?.id).toBe('tree')
    expect(restoreTree).toHaveBeenCalledWith({
      reason: 'release',
      fromOwnerId: 'tree-filter-input',
      target: { kind: 'active-cursor', ownerId: 'tree' },
    })
  })

  it('drops an unregistered owner from active and return state', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'tree', kind: 'pattern' })
    const unregisterInput = registry.register({ id: 'tree-edit-input', kind: 'temporary-control' })

    registry.activate('tree')
    registry.activate('tree-edit-input')
    unregisterInput()

    expect(registry.snapshot()).toEqual({
      activeOwnerId: 'tree',
      ownerIds: ['tree'],
      returnOwnerIds: [],
      restoreTarget: null,
    })
  })

  it('rejects duplicate owner ids', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'tree', kind: 'pattern' })

    expect(() => registry.register({ id: 'tree', kind: 'pattern' })).toThrow('[interaction] duplicate owner: tree')
  })
})
