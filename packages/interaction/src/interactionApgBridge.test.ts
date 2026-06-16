import { describe, expect, it } from 'vitest'

import {
  createApgInteractionOwner,
  defineApgInteractionOwner,
} from './apg'
import { createInteractionRouter } from './runtime'

const treeviewPattern = {
  apgPattern: 'treeview',
  rootRole: 'tree',
  focusModel: 'ariaActiveDescendant',
  keyboard: [
    {
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [{ events: [{ type: 'navigate', direction: 'next' }] }],
    },
    {
      shortcut: 'Space',
      preventDefault: true,
      cases: [{ events: [{ type: 'select' }] }],
    },
  ],
} as const

describe('APG interaction bridge', () => {
  it('defines a pattern owner from an APG-shaped pattern definition', () => {
    const definition = defineApgInteractionOwner({
      id: 'files.tree',
      label: 'Files',
      definition: treeviewPattern,
      shellRules: { allowGlobal: true },
    })

    expect(definition).toMatchObject({
      id: 'files.tree',
      kind: 'tree',
      runtimeKind: 'pattern',
      diagnostics: {
        label: 'Files',
        role: 'tree',
        source: 'apg:treeview',
      },
      focus: {
        strategy: 'aria-activedescendant',
        containment: 'local',
        restore: { kind: 'active-cursor', label: 'Files' },
        guard: {
          incidental: 'restore',
          scroll: 'restore',
          native: 'allow',
        },
      },
      shellRules: { allowGlobal: true },
    })
    expect(definition.keyRules).toEqual([
      expect.objectContaining({
        id: 'files.tree.apg.arrowdown',
        kind: 'navigation',
        keys: ['ArrowDown'],
        targetKinds: ['pattern', 'scroll-container', 'incidental'],
        targetPolicy: {
          nativeText: 'protect',
          nativeControl: 'protect',
          incidental: 'restore-owner',
          scroll: 'restore-owner',
        },
        action: {
          type: 'treeview.keyboard',
          params: {
            apgPattern: 'treeview',
            rootRole: 'tree',
            shortcut: 'ArrowDown',
          },
        },
      }),
      expect.objectContaining({
        id: 'files.tree.apg.space',
        kind: 'command',
        keys: [' ', 'Space'],
      }),
    ])
  })

  it('routes APG pattern ownership without stealing native text entry', () => {
    const owner = createApgInteractionOwner({
      id: 'files.tree',
      label: 'Files',
      definition: treeviewPattern,
    })
    const router = createInteractionRouter({
      owners: [owner],
      activeOwnerId: owner.id,
    })

    expect(router.route({
      key: 'ArrowDown',
      targetKind: 'scroll-container',
    })).toMatchObject({
      status: 'owner',
      reason: 'active-owner-handled',
      ownerId: 'files.tree',
      matchedKeyRule: {
        id: 'files.tree.apg.arrowdown',
        action: {
          type: 'treeview.keyboard',
          params: {
            apgPattern: 'treeview',
            rootRole: 'tree',
            shortcut: 'ArrowDown',
          },
        },
      },
    })

    expect(router.route({
      key: 'ArrowDown',
      targetKind: 'text-input',
    })).toMatchObject({
      status: 'native',
      reason: 'native-target-protected',
    })

    expect(router.route({
      key: ' ',
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      ownerId: 'files.tree',
      matchedKeyRule: {
        id: 'files.tree.apg.space',
      },
    })
  })

  it('maps Mod shortcuts to platform-specific primary modifiers', () => {
    const owner = createApgInteractionOwner({
      id: 'files.grid',
      definition: {
        apgPattern: 'grid',
        rootRole: 'grid',
        focusModel: 'rovingTabIndex',
        keyboard: [{ shortcut: 'Mod+Home', cases: [{ events: [{ type: 'navigate' }] }] }],
      },
    })
    const router = createInteractionRouter({
      owners: [owner],
      activeOwnerId: owner.id,
    })

    expect(router.route({
      key: 'Home',
      metaKey: true,
      platform: 'mac',
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      ownerId: 'files.grid',
    })
    expect(router.route({
      key: 'Home',
      ctrlKey: true,
      platform: 'windows',
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      ownerId: 'files.grid',
    })
  })
})
