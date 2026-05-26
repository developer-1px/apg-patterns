import { describe, expect, it } from 'vitest'

import { createInteractionOwnershipRegistry } from './interactionOwnership'
import {
  InteractionOwnerDefinitionSchema,
  compileInteractionOwnerDefinition,
  defineInteractionOwner,
  evaluateInteractionCondition,
} from './interactionDefinition'
import { routeInteractionKey } from './interactionRouting'

const treeDefinition = {
  id: 'project-tree',
  kind: 'tree',
  priority: 10,
  scope: 'region',
  mode: 'navigation',
  diagnostics: {
    label: 'Project tree',
    role: 'tree',
    source: 'apg-treeview',
    intent: 'preserve active cursor while incidental focus moves',
  },
  focus: {
    strategy: 'aria-activedescendant',
    containment: 'local',
    initial: { kind: 'selected' },
    restore: { kind: 'active-cursor', label: 'Tree cursor' },
    guard: {
      incidental: 'restore',
      scroll: 'restore',
      native: 'allow',
    },
  },
  keyRules: [
    {
      id: 'tree.arrow-down',
      kind: 'navigation',
      label: 'Move to next visible tree item',
      keys: ['ArrowDown'],
      targetKinds: ['pattern', 'scroll-container', 'incidental'],
      targetPolicy: {
        nativeText: 'protect',
        nativeControl: 'protect',
        incidental: 'restore-owner',
        scroll: 'restore-owner',
      },
      when: {
        type: 'all',
        conditions: [
          { type: 'owner.kind', equals: 'tree' },
          { type: 'owner.mode', equals: 'navigation' },
          { type: 'target.kind', in: ['pattern', 'scroll-container', 'incidental'] },
        ],
      },
      action: { type: 'tree.move', params: { direction: 'next' } },
      preventDefault: true,
      stopPropagation: true,
    },
  ],
} as const

describe('InteractionOwnerDefinitionSchema', () => {
  it('keeps owner definitions serializable after parsing', () => {
    const parsed = defineInteractionOwner(treeDefinition)

    expect(parsed).toEqual(JSON.parse(JSON.stringify(parsed)))
    expect(parsed.focus?.restore).toEqual({ kind: 'active-cursor', label: 'Tree cursor' })
    expect(parsed.keyRules[0]?.targetPolicy).toEqual({
      nativeText: 'protect',
      nativeControl: 'protect',
      incidental: 'restore-owner',
      scroll: 'restore-owner',
    })
  })

  it('rejects callback-shaped owner contracts', () => {
    const result = InteractionOwnerDefinitionSchema.safeParse({
      ...treeDefinition,
      ownsKey: () => true,
    })

    expect(result.success).toBe(false)
  })

  it('rejects duplicate key rule ids', () => {
    const result = InteractionOwnerDefinitionSchema.safeParse({
      ...treeDefinition,
      keyRules: [
        treeDefinition.keyRules[0],
        {
          ...treeDefinition.keyRules[0],
          keys: ['ArrowUp'],
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['keyRules', 1, 'id'])
    }
  })

  it('evaluates structured conditions without arbitrary predicates', () => {
    const definition = defineInteractionOwner(treeDefinition)
    const condition = definition.keyRules[0]!.when!

    expect(evaluateInteractionCondition(condition, definition, {
      key: 'ArrowDown',
      targetKind: 'scroll-container',
    })).toBe(true)
    expect(evaluateInteractionCondition(condition, definition, {
      key: 'ArrowDown',
      targetKind: 'text-input',
    })).toBe(false)
  })
})

describe('compileInteractionOwnerDefinition', () => {
  it('adapts declarative key rules to the current owner registry', () => {
    const registry = createInteractionOwnershipRegistry()
    const owner = compileInteractionOwnerDefinition(treeDefinition)

    registry.register(owner)
    registry.activate(owner.id)

    expect(routeInteractionKey(registry, {
      key: 'ArrowDown',
      targetKind: 'scroll-container',
    })).toMatchObject({
      status: 'owner',
      reason: 'active-owner-handled',
      ownerId: 'project-tree',
      matchedKeyRule: {
        id: 'tree.arrow-down',
        key: 'ArrowDown',
        kind: 'navigation',
      },
    })

    expect(routeInteractionKey(registry, {
      key: 'ArrowDown',
      targetKind: 'text-input',
    })).toMatchObject({
      status: 'native',
      reason: 'native-target-protected',
    })
  })

  it('compiles shell definitions without stealing native text entry', () => {
    const registry = createInteractionOwnershipRegistry()
    const shellOwner = compileInteractionOwnerDefinition({
      id: 'app-shell',
      kind: 'shell',
      scope: 'shell',
      keyRules: [
        {
          id: 'shell.command-palette',
          kind: 'shell',
          keys: ['k'],
          modifiers: ['Meta'],
          targetKinds: ['pattern', 'incidental'],
          action: { type: 'shell.open-command-palette' },
        },
      ],
    })

    registry.register(shellOwner)

    expect(routeInteractionKey(registry, {
      key: 'k',
      metaKey: true,
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      reason: 'shell-owner-handled',
      ownerId: 'app-shell',
    })

    expect(routeInteractionKey(registry, {
      key: 'k',
      metaKey: true,
      targetKind: 'text-input',
    })).toMatchObject({
      status: 'native',
      reason: 'native-target-protected',
    })
  })

  it('requires explicit target policy before shell definitions can own native text keys', () => {
    const registry = createInteractionOwnershipRegistry()
    const shellOwner = compileInteractionOwnerDefinition({
      id: 'save-command',
      kind: 'shell',
      scope: 'shell',
      keyRules: [
        {
          id: 'shell.save',
          kind: 'shell',
          keys: ['s'],
          modifiers: ['Meta'],
          targetKinds: ['text-input'],
          targetPolicy: {
            nativeText: 'allow-shell',
            nativeControl: 'protect',
            incidental: 'restore-owner',
            scroll: 'restore-owner',
          },
          action: { type: 'shell.save' },
        },
      ],
    })

    registry.register(shellOwner)

    expect(routeInteractionKey(registry, {
      key: 's',
      metaKey: true,
      targetKind: 'text-input',
    })).toMatchObject({
      status: 'owner',
      reason: 'shell-owner-handled',
      ownerId: 'save-command',
    })
  })

  it('compiles temporary owner restore keys and restore targets', () => {
    const registry = createInteractionOwnershipRegistry()
    const treeOwner = compileInteractionOwnerDefinition(treeDefinition)
    const inputOwner = compileInteractionOwnerDefinition({
      id: 'tree-filter',
      kind: 'input',
      scope: 'region',
      focus: {
        strategy: 'dom-focus',
        restore: { kind: 'previous-owner', label: 'Tree owner' },
      },
      keyRules: [
        {
          id: 'filter.escape',
          kind: 'restore',
          keys: ['Escape'],
          targetKinds: ['text-input'],
          action: { type: 'owner.restore' },
        },
      ],
    })

    registry.register(treeOwner)
    registry.register(inputOwner)
    registry.activate(treeOwner.id)
    registry.activate(inputOwner.id)

    expect(routeInteractionKey(registry, {
      key: 'Escape',
      targetKind: 'text-input',
    })).toMatchObject({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      ownerId: 'tree-filter',
      restoreOwnerId: 'project-tree',
      restoreTarget: {
        kind: 'active-cursor',
        ownerId: 'project-tree',
      },
    })
  })
})
