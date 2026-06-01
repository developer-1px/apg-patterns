import { describe, expect, it } from 'vitest'

import {
  createInteractionActions,
  createInteractionRouter,
  getInteractionRouteAction,
  shellOwner,
  temporaryControl,
} from './runtime'

type PaletteActions = {
  'palette.close': void
  'palette.move': { delta: number }
  'palette.open': void
  'palette.run': void
}

describe('runtime shortcut API', () => {
  it('models a closed command palette opened by a shell shortcut', () => {
    const actions = createInteractionActions<PaletteActions>()
    const shell = shellOwner<PaletteActions>({
      id: 'nano.shell',
      allowNativeText: true,
      keys: [{ key: 'k', code: 'KeyK', mod: 'primary', action: 'palette.open' }],
    })
    const palette = temporaryControl<PaletteActions>({
      id: 'nano.command-palette',
      restore: [{ key: 'Escape', action: 'palette.close' }],
      keys: {
        ArrowDown: { action: { type: 'palette.move', params: { delta: 1 } } },
        ArrowUp: { action: { type: 'palette.move', params: { delta: -1 } } },
        Enter: 'palette.run',
      },
    })
    const router = createInteractionRouter({
      owners: [shell, palette],
      platform: 'mac',
    })

    const openRoute = router.route({
      key: 'k',
      code: 'KeyK',
      metaKey: true,
      targetKind: 'text-input',
    })
    const openAction = actions.getRoute(openRoute, 'palette.open')

    expect(openRoute).toMatchObject({
      status: 'owner',
      reason: 'shell-owner-handled',
      ownerId: 'nano.shell',
    })
    expect(openAction?.type).toBe('palette.open')

    router.activate(palette.id)

    const moveRoute = router.route({ key: 'ArrowDown', targetKind: 'pattern' })
    const moveAction = actions.getRoute(moveRoute, 'palette.move')
    const delta: number | undefined = moveAction?.params.delta

    expect(delta).toBe(1)
    expect(router.route({ key: 'Escape', targetKind: 'pattern' })).toMatchObject({
      status: 'restore',
      matchedKeyRule: {
        action: { type: 'palette.close' },
      },
    })
  })

  it('creates a temporary control owner for common palette keys', () => {
    const palette = temporaryControl<PaletteActions>({
      id: 'nano.command-palette',
      restore: ['Escape'],
      keys: {
        ArrowDown: { action: { type: 'palette.move', params: { delta: 1 } } },
        ArrowUp: { action: { type: 'palette.move', params: { delta: -1 } } },
        Enter: 'palette.run',
      },
    })
    const router = createInteractionRouter({
      owners: [palette],
      activeOwnerId: palette.id,
    })

    const moveRoute = router.route({
      key: 'ArrowDown',
      targetKind: 'pattern',
    })
    const moveAction = getInteractionRouteAction<PaletteActions, 'palette.move'>(moveRoute, 'palette.move')

    expect(moveRoute).toMatchObject({
      status: 'owner',
      reason: 'active-owner-handled',
      ownerId: 'nano.command-palette',
    })
    expect(moveAction?.params.delta).toBe(1)

    expect(router.route({
      key: 'Escape',
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'restore',
      reason: 'temporary-owner-restore-requested',
      ownerId: 'nano.command-palette',
    })
  })

  it('maps primary shell shortcuts through the router platform', () => {
    const shell = shellOwner({
      id: 'nano.shell',
      keys: [
        {
          key: 'k',
          code: 'KeyK',
          mod: 'primary',
          action: 'palette.open',
        },
      ],
    })
    const macRouter = createInteractionRouter({
      owners: [shell],
      platform: 'mac',
    })
    const windowsRouter = createInteractionRouter({
      owners: [shell],
      platform: 'windows',
    })

    expect(macRouter.route({
      key: 'k',
      code: 'KeyK',
      metaKey: true,
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      reason: 'shell-owner-handled',
      ownerId: 'nano.shell',
    })

    expect(macRouter.route({
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'ignored',
      reason: 'no-owner',
    })

    expect(windowsRouter.route({
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      targetKind: 'pattern',
    })).toMatchObject({
      status: 'owner',
      reason: 'shell-owner-handled',
      ownerId: 'nano.shell',
    })
  })
})
