import { describe, expect, it } from 'vitest'

import {
  createInteractionDiagnosticsSnapshot,
  describeInteractionDomFocus,
} from './interactionDiagnostics'
import { evaluateInteractionFocusTarget } from './interactionFocusGuard'
import { createInteractionOwnershipRegistry } from './interactionOwnership'
import { routeInteractionKey } from './interactionRouting'

describe('interaction diagnostics', () => {
  it('combines owner stack, DOM focus, route reason, and restore target', () => {
    const registry = createInteractionOwnershipRegistry()
    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'rename-input'
    input.setAttribute('aria-label', 'Rename')

    registry.register({
      id: 'tree',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor', elementId: 'treeitem-docs' },
    })
    registry.register({
      id: 'tree-filter',
      kind: 'temporary-control',
      restoreKeys: (keyInput) => keyInput.key === 'Escape',
    })
    registry.activate('tree')
    registry.activate('tree-filter')

    const route = routeInteractionKey(registry, { key: 'Escape', targetKind: 'text-input' })
    const diagnostics = createInteractionDiagnosticsSnapshot(registry, { activeElement: input, route })

    expect(diagnostics).toMatchObject({
      activeOwnerId: 'tree-filter',
      activeOwnerKind: 'temporary-control',
      ownerIds: ['tree', 'tree-filter'],
      returnOwnerIds: ['tree'],
      ownerStack: ['tree', 'tree-filter'],
      restoreTarget: { kind: 'active-cursor', ownerId: 'tree', elementId: 'treeitem-docs' },
      domFocus: {
        targetKind: 'text-input',
        tagName: 'input',
        id: 'rename-input',
        ariaLabel: 'Rename',
      },
      route: {
        status: 'restore',
        reason: 'temporary-owner-restore-requested',
        restoreOwnerId: 'tree',
        restoreTarget: { kind: 'active-cursor', ownerId: 'tree', elementId: 'treeitem-docs' },
      },
    })
  })

  it('surfaces native fallback as an ignored route reason for diagnostics', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowDown',
    })
    registry.activate('tree')

    const route = routeInteractionKey(registry, { key: 's', metaKey: true, targetKind: 'pattern' })
    const diagnostics = createInteractionDiagnosticsSnapshot(registry, { route })

    expect(diagnostics.route).toMatchObject({
      status: 'native',
      reason: 'browser-fallback',
      ignoredReason: 'browser-fallback',
    })
  })

  it('captures focus guard intervention and DOM active element data', () => {
    const registry = createInteractionOwnershipRegistry()
    const scrollContainer = document.createElement('div')
    scrollContainer.id = 'tree-scroll'
    scrollContainer.tabIndex = 0
    scrollContainer.style.overflowY = 'auto'
    scrollContainer.setAttribute('role', 'region')
    scrollContainer.setAttribute('aria-label', 'Tree scroll container')

    registry.register({
      id: 'tree',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor' },
    })
    registry.activate('tree')

    const focusGuard = evaluateInteractionFocusTarget(registry, scrollContainer)
    const diagnostics = createInteractionDiagnosticsSnapshot(registry, {
      activeElement: scrollContainer,
      focusGuard,
    })

    expect(diagnostics.domFocus).toEqual({
      targetKind: 'scroll-container',
      tagName: 'div',
      id: 'tree-scroll',
      role: 'region',
      ariaLabel: 'Tree scroll container',
    })
    expect(diagnostics.focusGuard).toEqual({
      action: 'restore-active-owner',
      reason: 'focus-guard-intervention',
      targetKind: 'scroll-container',
      targetOwnerId: null,
      restoreTarget: { kind: 'active-cursor', ownerId: 'tree' },
      intervention: true,
    })
  })

  it('describes non-element focus targets without DOM fields', () => {
    expect(describeInteractionDomFocus(null)).toEqual({ targetKind: 'unknown' })
  })
})
