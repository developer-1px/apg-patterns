import { describe, expect, it, vi } from 'vitest'

import { createInteractionOwnershipRegistry } from './interactionOwnership'
import {
  handleInteractionKeyboardEvent,
  interactionKeyInputFromKeyboardEvent,
  routeInteractionKeyboardEvent,
  type InteractionKeyboardEventLike,
} from './interactionKeyboardEvent'

describe('interaction keyboard event adapter', () => {
  it('routes arrow keys from an incidental scroll container back to the active APG owner', () => {
    const registry = createInteractionOwnershipRegistry()
    const preventDefault = vi.fn()
    const onOwnerKey = vi.fn()
    const scrollContainer = document.createElement('div')
    scrollContainer.tabIndex = 0
    scrollContainer.style.overflowY = 'auto'

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowDown',
    })
    registry.activate('tree')

    const result = handleInteractionKeyboardEvent({
      registry,
      event: keyboardEvent({ key: 'ArrowDown', target: scrollContainer, preventDefault }),
      onOwnerKey,
    })

    expect(result.input.targetKind).toBe('scroll-container')
    expect(result.route).toMatchObject({
      status: 'owner',
      reason: 'active-owner-handled',
      ownerId: 'tree',
    })
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(onOwnerKey).toHaveBeenCalledWith(result, expect.objectContaining({ key: 'ArrowDown' }))
  })

  it('preserves native text entry when an APG owner is active', () => {
    const registry = createInteractionOwnershipRegistry()
    const preventDefault = vi.fn()
    const onNativeKey = vi.fn()
    const input = document.createElement('input')
    input.type = 'text'

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (keyInput) => keyInput.key === 'ArrowDown',
    })
    registry.activate('tree')

    const result = handleInteractionKeyboardEvent({
      registry,
      event: keyboardEvent({ key: 'ArrowDown', target: input, preventDefault }),
      onNativeKey,
    })

    expect(result).toEqual({
      input: {
        key: 'ArrowDown',
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        targetKind: 'text-input',
      },
      route: {
        status: 'native',
        reason: 'native-target-protected',
        activeOwnerId: 'tree',
        candidateOwnerIds: ['tree'],
        targetKind: 'text-input',
      },
    })
    expect(preventDefault).not.toHaveBeenCalled()
    expect(onNativeKey).toHaveBeenCalledWith(result, expect.objectContaining({ key: 'ArrowDown' }))
  })

  it('can release a temporary owner when a restore key is routed', () => {
    const registry = createInteractionOwnershipRegistry()
    const preventDefault = vi.fn()
    const restoreTree = vi.fn()
    const editor = document.createElement('input')
    editor.type = 'text'

    registry.register({
      id: 'grid',
      kind: 'pattern',
      restoreTarget: { kind: 'edited-cell', elementId: 'gridcell-e11' },
      restore: restoreTree,
    })
    registry.register({
      id: 'grid-cell-editor',
      kind: 'temporary-control',
      restoreKeys: (input) => input.key === 'Escape' || input.key === 'F2',
    })
    registry.activate('grid')
    registry.activate('grid-cell-editor')

    const result = handleInteractionKeyboardEvent({
      registry,
      event: keyboardEvent({ key: 'Escape', target: editor, preventDefault }),
      releaseOnRestore: true,
    })

    expect(result.route).toMatchObject({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      ownerId: 'grid-cell-editor',
      restoreOwnerId: 'grid',
      restoreTarget: { kind: 'edited-cell', ownerId: 'grid', elementId: 'gridcell-e11' },
    })
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(registry.getActiveOwner()?.id).toBe('grid')
    expect(restoreTree).toHaveBeenCalledWith({
      reason: 'cancel',
      fromOwnerId: 'grid-cell-editor',
      target: { kind: 'edited-cell', ownerId: 'grid', elementId: 'gridcell-e11' },
    })
  })

  it('routes allowed shell shortcuts and leaves disallowed shortcuts to the browser', () => {
    const registry = createInteractionOwnershipRegistry()
    const commandTarget = document.createElement('div')
    commandTarget.setAttribute('role', 'tree')

    registry.register({
      id: 'tree',
      kind: 'pattern',
      ownsKey: (input) => input.key === 'ArrowDown',
      allowsShellKey: (input) => input.metaKey === true && input.key === 'k',
    })
    registry.register({
      id: 'command-palette',
      kind: 'shell',
      ownsKey: (input) => input.metaKey === true && input.key === 'k',
    })
    registry.activate('tree')

    expect(routeInteractionKeyboardEvent(registry, keyboardEvent({ key: 'k', metaKey: true, target: commandTarget }))).toMatchObject({
      route: {
        status: 'owner',
        reason: 'shell-owner-handled',
        ownerId: 'command-palette',
      },
    })
    expect(routeInteractionKeyboardEvent(registry, keyboardEvent({ key: 's', metaKey: true, target: commandTarget }))).toMatchObject({
      route: {
        status: 'native',
        reason: 'browser-fallback',
      },
    })
  })

  it('normalizes keyboard modifier state and target kind from an event-like input', () => {
    const button = document.createElement('button')

    expect(interactionKeyInputFromKeyboardEvent(keyboardEvent({
      key: 'Enter',
      code: 'Enter',
      platform: 'mac',
      shiftKey: true,
      target: button,
    }))).toEqual({
      key: 'Enter',
      code: 'Enter',
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      platform: 'mac',
      shiftKey: true,
      targetKind: 'native-control',
    })
  })

  it('uses declarative preventDefault and stopPropagation policy from the matched key rule', () => {
    const registry = createInteractionOwnershipRegistry()
    const preventDefault = vi.fn()
    const stopPropagation = vi.fn()

    registry.register({
      id: 'toolbar',
      kind: 'pattern',
      diagnostics: {
        keyRules: [{
          id: 'toolbar.next',
          keys: ['ArrowRight'],
          kind: 'navigation',
          preventDefault: false,
          stopPropagation: true,
        }],
      },
      ownsKey: (input) => input.key === 'ArrowRight',
    })
    registry.activate('toolbar')

    handleInteractionKeyboardEvent({
      registry,
      event: keyboardEvent({ key: 'ArrowRight', preventDefault, stopPropagation }),
    })

    expect(preventDefault).not.toHaveBeenCalled()
    expect(stopPropagation).toHaveBeenCalledTimes(1)
  })
})

function keyboardEvent({
  key,
  code,
  altKey = false,
  ctrlKey = false,
  metaKey = false,
  platform,
  shiftKey = false,
  target = null,
  preventDefault = vi.fn(),
  stopPropagation = vi.fn(),
}: {
  key: string
  code?: string
  altKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  platform?: InteractionKeyboardEventLike['platform']
  shiftKey?: boolean
  target?: EventTarget | null
  preventDefault?: () => void
  stopPropagation?: () => void
}): InteractionKeyboardEventLike {
  return {
    key,
    code,
    altKey,
    ctrlKey,
    metaKey,
    platform,
    shiftKey,
    target,
    preventDefault,
    stopPropagation,
  }
}
