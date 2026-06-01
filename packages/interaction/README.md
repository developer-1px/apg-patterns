# @interactive-os/interaction

Keyboard and focus ownership primitives for application shells.

This package coordinates who owns a keyboard event when an app shell combines
APG composites, native controls, custom commands, scroll containers, dialogs,
popovers, and global shortcuts.

The runtime entry is React-free and Zod-free. React support is isolated
behind `@interactive-os/interaction/react` and uses React as an optional peer.

## Install

```bash
npm install @interactive-os/interaction
```

For React hooks:

```bash
npm install @interactive-os/interaction react
```

## Entrypoints

```ts
import { createInteractionRouter, temporaryControl } from '@interactive-os/interaction/runtime'
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction/definition'
import { InteractionProvider } from '@interactive-os/interaction/react'
```

- `@interactive-os/interaction/runtime`: Zod-free ownership registry, key
  routing, focus guard decisions, keyboard event adapter, shortcut owners,
  typed action helpers, and unchecked compile for trusted static definitions.
- `@interactive-os/interaction/definition`: Zod schemas, validation helpers,
  and checked compile for JSON, catalogs, docs, LLM-authored definitions, and
  tests.
- `@interactive-os/interaction`: compatibility aggregate. Prefer the subpaths
  for bundle-sensitive code. Root and definition imports load Zod-backed schema
  code; production runtime code should import the runtime subpath.
- `@interactive-os/interaction/react`: optional React provider and hooks.

## Command Palette Quick Start

Most app code starts closed. A shell shortcut opens a temporary control, then
that control owns its local navigation and restore keys.

```ts
import {
  createInteractionActions,
  createInteractionRouter,
  detectInteractionPlatform,
  shellOwner,
  temporaryControl,
} from '@interactive-os/interaction/runtime'

type PaletteActions = {
  'palette.close': void
  'palette.move': { delta: number }
  'palette.open': void
  'palette.run': void
}

declare function movePaletteCursor(delta: number): void
declare function runPaletteItem(): void
declare function closePalette(): void

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
  platform: detectInteractionPlatform(),
  owners: [shell, palette],
})

function onKeyDown(event: KeyboardEvent) {
  router.handleEvent(event, {
    releaseOnRestore: true,
    onOwnerKey({ route }) {
      if (actions.getRoute(route, 'palette.open')) {
        router.activate(palette.id)
        return
      }

      const move = actions.getRoute(route, 'palette.move')
      if (move) movePaletteCursor(move.params.delta)

      if (actions.getRoute(route, 'palette.run')) runPaletteItem()
    },
    onRestoreKey({ route }) {
      if (actions.getRoute(route, 'palette.close')) closePalette()
    },
  })
}
```

Command palettes, slash menus, and cell editors are temporary controls. App
shortcuts live in shell owners. APG composites such as trees and grids are
pattern owners.

`restore: ['Escape']` is enough when the host only needs a restore route.
Use `restore: [{ key: 'Escape', action: 'palette.close' }]` when the close
effect should be typed and dispatched like other actions.

## Declarative Definition Example

```ts
import {
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} from '@interactive-os/interaction/runtime'
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction/definition'

const registry = createInteractionOwnershipRegistry()

registry.register(compileInteractionOwnerDefinition({
  id: 'files.tree',
  kind: 'tree',
  focus: {
    strategy: 'aria-activedescendant',
    restore: { kind: 'active-cursor', label: 'Files' },
  },
  keyRules: [
    {
      id: 'files.next',
      kind: 'navigation',
      keys: ['ArrowDown'],
      targetKinds: ['pattern', 'scroll-container', 'incidental'],
      action: { type: 'tree.move', params: { direction: 'next' } },
      preventDefault: true,
    },
  ],
}))

registry.activate('files.tree')

const route = routeInteractionKey(registry, {
  key: 'ArrowDown',
  targetKind: 'scroll-container',
})

route.status
```

`InteractionOwnerDefinitionSchema` validates this serializable contract before
it is adapted to the current owner registry. Use this layer for catalogs,
documentation, generated definitions, and dev/test validation. Runtime effects
stay behind action descriptors and host adapters.

Use `defineInteractionOwner` when you only want validation and the typed
definition back. Use `compileInteractionOwnerDefinition` when you want to
register it in the current runtime registry.

Definition `kind` values such as `tree`, `grid`, and `toolbar` compile to the
runtime owner kind `pattern`. Values such as `input`, `form`, `editor`,
`dialog`, and `popover` compile to `temporary-control`. `shell` compiles to
`shell`.

## React Example

```tsx
import { useMemo } from 'react'
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction/definition'
import {
  InteractionProvider,
  useInteractionKeyboardHandler,
  useInteractionOwner,
} from '@interactive-os/interaction/react'

function FilesTree() {
  const owner = useMemo(
    () => compileInteractionOwnerDefinition({
      id: 'files.tree',
      kind: 'tree',
      focus: {
        strategy: 'aria-activedescendant',
        restore: { kind: 'active-cursor', label: 'Files' },
      },
      keyRules: [
        {
          id: 'files.next',
          kind: 'navigation',
          keys: ['ArrowDown'],
          targetKinds: ['pattern', 'scroll-container', 'incidental'],
          action: { type: 'tree.move', params: { direction: 'next' } },
        },
      ],
    }),
    [],
  )
  useInteractionOwner(owner, { active: true })

  const onKeyDown = useInteractionKeyboardHandler()

  return <div role="tree" tabIndex={0} onKeyDown={onKeyDown} />
}

export function App() {
  return (
    <InteractionProvider>
      <FilesTree />
    </InteractionProvider>
  )
}
```

## Temporary Control Inside A Pattern

Activating a temporary owner records the previously active owner. A `restore`
key route points back to that previous owner; the restore target is read from
the owner being restored.

```ts
import {
  compileInteractionOwnerDefinition,
} from '@interactive-os/interaction/definition'
import {
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
  type InteractionKeyboardEventLike,
} from '@interactive-os/interaction/runtime'

const registry = createInteractionOwnershipRegistry()

registry.register(compileInteractionOwnerDefinition({
  id: 'files.tree',
  kind: 'tree',
  focus: {
    strategy: 'aria-activedescendant',
    restore: { kind: 'active-cursor', label: 'Files' },
  },
}))

registry.register(compileInteractionOwnerDefinition({
  id: 'files.search',
  kind: 'input',
  focus: {
    strategy: 'dom-focus',
    initial: { kind: 'element', elementId: 'files-search' },
  },
  keyRules: [
    {
      id: 'files.search.escape',
      kind: 'restore',
      keys: ['Escape'],
      targetKinds: ['text-input'],
      action: { type: 'search.close' },
    },
  ],
}))

registry.activate('files.tree')
registry.activate('files.search')

function onSearchKeyDown(event: InteractionKeyboardEventLike) {
  return handleInteractionKeyboardEvent({
    registry,
    event,
    releaseOnRestore: true,
    onRestoreKey({ route }) {
      route.restoreOwnerId // "files.tree"
      route.restoreTarget // { kind: "active-cursor", ownerId: "files.tree", ... }
    },
  })
}
```

## App Shell Shortcuts

Native text entry is protected by default. A shell shortcut can run from text
inputs only when the shortcut owner opts into `allowNativeText`.

```ts
import { shellOwner } from '@interactive-os/interaction/runtime'

const owner = shellOwner({
  id: 'app.shell',
  keys: [
    {
      key: 'k',
      code: 'KeyK',
      mod: 'primary',
      action: 'command-palette.open',
    },
    {
      key: 's',
      code: 'KeyS',
      mod: 'primary',
      action: 'app.save',
    },
  ],
  allowNativeText: true,
})
```

If a pattern owner is active, shell shortcuts run only when that active owner
declares `shellRules: { allowGlobal: true }`.

`mod: "primary"` compiles to Meta on macOS and Control on Windows/Linux when
the route input includes `platform: "mac" | "windows" | "linux"`. Without a
platform, the base binding uses Control. `code` is optional and narrows a rule
to a physical key when route input includes `code`.

For macOS production shortcuts, pass `platform: "mac"` or use
`detectInteractionPlatform()` through `createInteractionRouter`. Otherwise a
primary shortcut behaves like Control.

When a rule matches, the route exposes `route.matchedKeyRule?.action` so the
host shell can dispatch the declared effect. `handleInteractionKeyboardEvent`
also honors matched `preventDefault` and `stopPropagation` values.

## Package Boundary

This package does not implement APG pattern behavior. It coordinates ownership
between owners that already know their own keyboard contracts.

It can compose with `@interactive-os/aria`, React Aria, Radix, Ariakit, custom
widgets, native controls, or app-specific shell shortcuts. It does not import
`@interactive-os/aria`.

## Verification

```bash
npm run check
```

`check` runs type checking, unit tests, a production build, and a packed
consumer smoke test for the root, runtime, definition, and React subpaths.

## License

MIT. See [LICENSE](LICENSE).
