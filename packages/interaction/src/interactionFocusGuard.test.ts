import { describe, expect, it } from 'vitest'

import {
  createInteractionOwnershipRegistry,
} from './interactionOwnership'
import {
  evaluateInteractionFocusGuard,
  evaluateInteractionFocusTarget,
} from './interactionFocusGuard'

describe('interaction focus guard', () => {
  it('reports a restore action when incidental focus steals a pattern owner', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'tree',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor', elementId: 'treeitem-docs' },
    })
    registry.activate('tree')

    expect(evaluateInteractionFocusGuard(registry, { targetKind: 'scroll-container' })).toEqual({
      action: 'restore-active-owner',
      reason: 'focus-guard-intervention',
      activeOwnerId: 'tree',
      activeOwnerKind: 'pattern',
      targetKind: 'scroll-container',
      targetOwnerId: null,
      targetOwnerKind: null,
      restoreTarget: { kind: 'active-cursor', ownerId: 'tree', elementId: 'treeitem-docs' },
    })
  })

  it('allows native text and controls instead of forcing pattern restoration', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({
      id: 'listbox',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor' },
    })
    registry.activate('listbox')

    expect(evaluateInteractionFocusGuard(registry, { targetKind: 'text-input' })).toMatchObject({
      action: 'allow-native-focus',
      reason: 'native-target-allowed',
      activeOwnerId: 'listbox',
      activeOwnerKind: 'pattern',
      targetKind: 'text-input',
    })
    expect(evaluateInteractionFocusGuard(registry, { targetKind: 'native-control' })).toMatchObject({
      action: 'allow-native-focus',
      reason: 'native-target-allowed',
      activeOwnerId: 'listbox',
      activeOwnerKind: 'pattern',
      targetKind: 'native-control',
    })
  })

  it('reports explicit handoff when focus enters another declared owner', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'listbox', kind: 'pattern' })
    registry.register({ id: 'toolbar', kind: 'pattern' })
    registry.activate('listbox')

    expect(evaluateInteractionFocusGuard(registry, { targetKind: 'pattern', targetOwnerId: 'toolbar' })).toEqual({
      action: 'activate-target-owner',
      reason: 'declared-owner-target',
      activeOwnerId: 'listbox',
      activeOwnerKind: 'pattern',
      targetKind: 'pattern',
      targetOwnerId: 'toolbar',
      targetOwnerKind: 'pattern',
    })
  })

  it('does not guard while a temporary owner is active', () => {
    const registry = createInteractionOwnershipRegistry()

    registry.register({ id: 'grid', kind: 'pattern' })
    registry.register({ id: 'grid-cell-editor', kind: 'temporary-control' })
    registry.activate('grid')
    registry.activate('grid-cell-editor')

    expect(evaluateInteractionFocusGuard(registry, { targetKind: 'scroll-container' })).toMatchObject({
      action: 'allow-native-focus',
      reason: 'temporary-owner-active',
      activeOwnerId: 'grid-cell-editor',
      activeOwnerKind: 'temporary-control',
      targetKind: 'scroll-container',
    })
  })

  it('classifies DOM focus targets in the DOM adapter helper', () => {
    const registry = createInteractionOwnershipRegistry()
    const scrollContainer = document.createElement('div')
    scrollContainer.tabIndex = 0
    scrollContainer.style.overflowY = 'auto'

    registry.register({
      id: 'tree',
      kind: 'pattern',
      restoreTarget: { kind: 'active-cursor' },
    })
    registry.activate('tree')

    expect(evaluateInteractionFocusTarget(registry, scrollContainer)).toMatchObject({
      action: 'restore-active-owner',
      reason: 'focus-guard-intervention',
      targetKind: 'scroll-container',
      restoreTarget: { kind: 'active-cursor', ownerId: 'tree' },
    })
  })
})
