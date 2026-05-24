import { describe, expect, it } from 'vitest'

import { createInteractionOwnershipRegistry } from './interactionOwnership'
import { routeInteractionKey } from './interactionRouting'

describe('interaction key routing', () => {
  it('keeps APG pattern ownership when focus moves to an incidental scroll container', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      diagnostics: {
        role: 'tree',
        activeCursor: 'docs',
        focusStrategy: 'rovingTabIndex',
        keyRules: [{ id: 'tree.navigate.next', keys: ['ArrowDown'], kind: 'navigation', label: 'Move to next visible node' }],
      },
      ownsKey: (input) => input.key === 'ArrowDown',
    })
    registry.activate('tree')

    expect(routeInteractionKey(registry, { key: 'ArrowDown', targetKind: 'scroll-container' })).toEqual({
      status: 'owner',
      reason: 'active-owner-handled',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree'],
      targetKind: 'scroll-container',
      ownerId: 'tree',
      ownerKind: 'pattern',
      matchedKeyRule: {
        id: 'tree.navigate.next',
        key: 'ArrowDown',
        kind: 'navigation',
        label: 'Move to next visible node',
      },
    })
  })

  it('protects native text entry from an active pattern owner unless ownership is explicit', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowDown',
    })
    registry.activate('tree')

    expect(routeInteractionKey(registry, { key: 'ArrowDown', targetKind: 'text-input' })).toEqual({
      status: 'native',
      reason: 'native-target-protected',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree'],
      targetKind: 'text-input',
    })
  })

  it('surfaces restore intent for temporary controls without mutating registry state', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'grid',
      kind: 'pattern',
      restoreTarget: { kind: 'edited-cell', elementId: 'cell-a1' },
    })
    registry.register({
      id: 'grid-cell-editor',
      kind: 'temporary-control',
      restoreKeys: (input) => input.key === 'Escape' || input.key === 'F2',
    })

    registry.activate('grid')
    registry.activate('grid-cell-editor')

    expect(routeInteractionKey(registry, { key: 'Escape', targetKind: 'text-input' })).toEqual({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      activeOwnerId: 'grid-cell-editor',
      candidateOwnerIds: ['grid-cell-editor'],
      targetKind: 'text-input',
      ownerId: 'grid-cell-editor',
      ownerKind: 'temporary-control',
      restoreOwnerId: 'grid',
      restoreTarget: { kind: 'edited-cell', ownerId: 'grid', elementId: 'cell-a1' },
    })
    expect(registry.getActiveOwner()?.id).toBe('grid-cell-editor')
  })

  it('routes shell shortcuts only when the active owner allows them', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowDown',
      allowsShellKey: (input) => input.metaKey === true && input.key === 'k',
    })
    registry.register({
      id: 'command-palette',
      kind: 'shell',
      diagnostics: {
        keyRules: [{ id: 'shell.commandPalette.open', keys: ['k'], metaKey: true, kind: 'shell', label: 'Open command palette' }],
      },
      ownsKey: (input) => input.metaKey === true && input.key === 'k',
    })
    registry.activate('tree')

    expect(routeInteractionKey(registry, { key: 'k', metaKey: true, targetKind: 'pattern' })).toEqual({
      status: 'owner',
      reason: 'shell-owner-handled',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree', 'command-palette'],
      targetKind: 'pattern',
      ownerId: 'command-palette',
      ownerKind: 'shell',
      matchedKeyRule: {
        id: 'shell.commandPalette.open',
        key: 'k',
        kind: 'shell',
        label: 'Open command palette',
      },
    })

    expect(routeInteractionKey(registry, { key: 's', metaKey: true, targetKind: 'pattern' })).toEqual({
      status: 'native',
      reason: 'browser-fallback',
      activeOwnerId: 'tree',
      candidateOwnerIds: ['tree'],
      targetKind: 'pattern',
    })
  })

  it('does not route shell shortcuts from native text targets without an owning context', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'save-command',
      kind: 'shell',
      ownsKey: (input) => input.metaKey === true && input.key === 's',
    })

    expect(routeInteractionKey(registry, { key: 's', metaKey: true, targetKind: 'textarea' })).toEqual({
      status: 'native',
      reason: 'native-target-protected',
      activeOwnerId: null,
      candidateOwnerIds: [],
      targetKind: 'textarea',
    })
  })

  it('lets a temporary owner opt shell shortcuts in while preserving native text fallback', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'tree', kind: 'pattern' })
    registry.register({
      id: 'rename-input',
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      allowsShellKey: (input) => input.metaKey === true && input.key === 's',
    })
    registry.register({
      id: 'save-command',
      kind: 'shell',
      ownsKey: (input) => input.metaKey === true && input.key === 's',
    })

    registry.activate('tree')
    registry.activate('rename-input')

    expect(routeInteractionKey(registry, { key: 'a', targetKind: 'text-input' })).toEqual({
      status: 'native',
      reason: 'browser-fallback',
      activeOwnerId: 'rename-input',
      candidateOwnerIds: ['rename-input'],
      targetKind: 'text-input',
    })
    expect(routeInteractionKey(registry, { key: 's', metaKey: true, targetKind: 'text-input' })).toEqual({
      status: 'owner',
      reason: 'shell-owner-handled',
      activeOwnerId: 'rename-input',
      candidateOwnerIds: ['rename-input', 'save-command'],
      targetKind: 'text-input',
      ownerId: 'save-command',
      ownerKind: 'shell',
    })
  })

  it('covers a non-APG shell search owner without pattern ownership', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'command-palette',
      kind: 'shell',
      ownsKey: (input) => input.key === 'Escape',
      restoreTarget: { kind: 'invoker', elementId: 'palette-button' },
    })
    registry.register({
      id: 'palette-search',
      kind: 'temporary-control',
      ownsKey: (input) => input.key === 'Escape',
      restoreKeys: (input) => input.key === 'Escape',
      allowsShellKey: (input) => input.metaKey === true && input.key === 'k',
    })
    registry.register({
      id: 'run-command',
      kind: 'shell',
      ownsKey: (input) => input.metaKey === true && input.key === 'k',
    })

    registry.activate('command-palette')
    registry.activate('palette-search')

    expect(routeInteractionKey(registry, { key: 'ArrowDown', targetKind: 'text-input' })).toEqual({
      status: 'native',
      reason: 'browser-fallback',
      activeOwnerId: 'palette-search',
      candidateOwnerIds: ['palette-search'],
      targetKind: 'text-input',
    })
    expect(routeInteractionKey(registry, { key: 'Escape', targetKind: 'text-input' })).toEqual({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      activeOwnerId: 'palette-search',
      candidateOwnerIds: ['palette-search'],
      targetKind: 'text-input',
      ownerId: 'palette-search',
      ownerKind: 'temporary-control',
      restoreOwnerId: 'command-palette',
      restoreTarget: { kind: 'invoker', ownerId: 'command-palette', elementId: 'palette-button' },
    })
    expect(routeInteractionKey(registry, { key: 'k', metaKey: true, targetKind: 'text-input' })).toEqual({
      status: 'owner',
      reason: 'shell-owner-handled',
      activeOwnerId: 'palette-search',
      candidateOwnerIds: ['palette-search', 'run-command'],
      targetKind: 'text-input',
      ownerId: 'run-command',
      ownerKind: 'shell',
    })
  })
})
