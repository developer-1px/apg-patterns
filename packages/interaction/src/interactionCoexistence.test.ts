import { describe, expect, it, vi } from 'vitest'

import { createInteractionOwnershipRegistry } from './interactionOwnership'
import { routeInteractionKey } from './interactionRouting'

// These tests pin the contract for several APG pattern owners living on the same
// page at once. The single-owner unit tests cover one pattern plus a temporary
// control; here the question is whether keys and focus stay correctly owned when
// pattern + pattern + pattern coexist and the active one switches.
describe('interaction multi-pattern coexistence', () => {
  it('routes a key only to the active pattern while sibling patterns stay silent', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'tree', kind: 'pattern', ownsKey: (i) => i.key === 'ArrowUp' || i.key === 'ArrowDown' })
    registry.register({ id: 'toolbar', kind: 'pattern', ownsKey: (i) => i.key === 'ArrowLeft' || i.key === 'ArrowRight' })
    registry.register({ id: 'listbox', kind: 'pattern', ownsKey: (i) => i.key === 'ArrowUp' || i.key === 'ArrowDown' })

    registry.activate('tree')

    // The active pattern claims its own navigation key.
    expect(routeInteractionKey(registry, { key: 'ArrowDown', targetKind: 'pattern' })).toEqual({
      status: 'owner',
      reason: 'active-owner-handled',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree'],
      targetKind: 'pattern',
      ownerId: 'tree',
      ownerKind: 'pattern',
    })

    // A sibling pattern's key is NOT stolen by the active pattern; it falls
    // through to the browser instead of being mis-handled.
    expect(routeInteractionKey(registry, { key: 'ArrowRight', targetKind: 'pattern' })).toEqual({
      status: 'native',
      reason: 'browser-fallback',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree'],
      targetKind: 'pattern',
    })

    // Ownership is symmetric: after switching, the toolbar claims its keys and
    // the tree's keys now fall through.
    registry.activate('toolbar')

    expect(routeInteractionKey(registry, { key: 'ArrowRight', targetKind: 'pattern' })).toEqual({
      status: 'owner',
      reason: 'active-owner-handled',
      activeOwnerId: 'toolbar',
      candidateOwnerIds: ['toolbar'],
      targetKind: 'pattern',
      ownerId: 'toolbar',
      ownerKind: 'pattern',
    })
    expect(routeInteractionKey(registry, { key: 'ArrowDown', targetKind: 'pattern' }).reason).toBe('browser-fallback')
  })

  it('does not accumulate a restore stack when switching between sibling patterns', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'tree', kind: 'pattern' })
    registry.register({ id: 'listbox', kind: 'pattern' })
    registry.register({ id: 'toolbar', kind: 'pattern' })

    registry.activate('tree')
    registry.activate('listbox')
    registry.activate('toolbar')

    // Sibling patterns are peers, not a modal stack: each switch resets the
    // return path, so closing one pattern never silently re-activates another.
    expect(registry.snapshot()).toEqual({
      activeOwnerId: 'toolbar',
      ownerIds: ['tree', 'listbox', 'toolbar'],
      returnOwnerIds: [],
      restoreTarget: null,
    })

    expect(registry.release('toolbar')).toBeNull()
    expect(registry.getActiveOwner()).toBeNull()
  })

  it('restores a temporary control to the exact pattern it opened over, not the first registered one', () => {
    const registry = createInteractionOwnershipRegistry()
    const restoreListbox = vi.fn()

    registry.register({ id: 'tree', kind: 'pattern', restoreTarget: { kind: 'active-cursor', label: 'Tree' } })
    registry.register({
      id: 'listbox',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor', label: 'Listbox' },
      restore: restoreListbox,
    })
    registry.register({ id: 'search', kind: 'temporary-control', restoreKeys: (i) => i.key === 'Escape' })

    registry.activate('tree')
    registry.activate('listbox') // sibling switch clears the stack
    registry.activate('search') // temporary control stacks over the listbox

    expect(registry.snapshot().returnOwnerIds).toEqual(['listbox'])

    // The restore intent points back to the listbox the search opened over,
    // even though the tree was the first pattern activated on the page.
    expect(routeInteractionKey(registry, { key: 'Escape', targetKind: 'text-input' })).toEqual({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      activeOwnerId: 'search',
      candidateOwnerIds: ['search'],
      targetKind: 'text-input',
      ownerId: 'search',
      ownerKind: 'temporary-control',
      restoreOwnerId: 'listbox',
      restoreTarget: { kind: 'active-cursor', ownerId: 'listbox', label: 'Listbox' },
    })

    // Committing the release hands ownership back to the listbox and fires its
    // restore hook with the listbox cursor target.
    expect(registry.release('search')?.id).toBe('listbox')
    expect(restoreListbox).toHaveBeenCalledWith({
      reason: 'release',
      fromOwnerId: 'search',
      target: { kind: 'active-cursor', ownerId: 'listbox', label: 'Listbox' },
    })
  })

  it('routes a shell shortcut to the global owner regardless of which sibling pattern is active', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (i) => i.key === 'ArrowDown',
      allowsShellKey: (i) => i.metaKey === true && i.key === 'k',
    })
    registry.register({
      id: 'listbox',
      kind: 'pattern',
      ownsKey: (i) => i.key === 'ArrowDown',
      allowsShellKey: (i) => i.metaKey === true && i.key === 'k',
    })
    registry.register({ id: 'command-palette', kind: 'shell', ownsKey: (i) => i.metaKey === true && i.key === 'k' })

    for (const active of ['tree', 'listbox'] as const) {
      registry.activate(active)

      expect(routeInteractionKey(registry, { key: 'k', metaKey: true, targetKind: 'pattern' })).toEqual({
        status: 'owner',
        reason: 'shell-owner-handled',
        activeOwnerId: active,
        candidateOwnerIds: [active, 'command-palette'],
        targetKind: 'pattern',
        ownerId: 'command-palette',
        ownerKind: 'shell',
      })
    }
  })
})
