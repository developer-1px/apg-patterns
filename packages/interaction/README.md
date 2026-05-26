# @interactive-os/interaction

Keyboard and focus ownership primitives for application shells.

This package coordinates who owns a keyboard event when an app shell combines
APG composites, native controls, custom commands, scroll containers, dialogs,
popovers, and global shortcuts.

The root entry is React-free. React support is isolated behind
`@interactive-os/interaction/react` and uses React as an optional peer.

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
import { createInteractionOwnershipRegistry } from '@interactive-os/interaction'
import { InteractionProvider } from '@interactive-os/interaction/react'
```

- `@interactive-os/interaction`: React-free Zod definition schemas, ownership
  registry, key routing, focus guard decisions, keyboard event adapter, and
  diagnostics.
- `@interactive-os/interaction/react`: optional React provider and hooks.

## Declarative Example

```ts
import {
  compileInteractionOwnerDefinition,
  createInteractionOwnershipRegistry,
  routeInteractionKey,
} from '@interactive-os/interaction'

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
it is adapted to the current owner registry. Runtime effects stay behind action
descriptors and host adapters.

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
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction'
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
  createInteractionOwnershipRegistry,
  handleInteractionKeyboardEvent,
  type InteractionKeyboardEventLike,
} from '@interactive-os/interaction'

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
inputs only when the matching key rule declares
`targetPolicy.nativeText: "allow-shell"`.

```ts
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction'

const shellOwner = compileInteractionOwnerDefinition({
  id: 'app.shell',
  kind: 'shell',
  scope: 'shell',
  keyRules: [
    {
      id: 'command-palette.open',
      kind: 'shell',
      keys: ['k'],
      code: ['KeyK'],
      modifiers: ['Control'],
      platform: {
        mac: { keys: ['k'], code: ['KeyK'], modifiers: ['Meta'] },
        windows: { keys: ['k'], code: ['KeyK'], modifiers: ['Control'] },
        linux: { keys: ['k'], code: ['KeyK'], modifiers: ['Control'] },
      },
      targetKinds: ['pattern', 'incidental'],
      action: { type: 'command-palette.open' },
      preventDefault: true,
    },
    {
      id: 'app.save',
      kind: 'shell',
      keys: ['s'],
      code: ['KeyS'],
      modifiers: ['Control'],
      platform: {
        mac: { keys: ['s'], code: ['KeyS'], modifiers: ['Meta'] },
        windows: { keys: ['s'], code: ['KeyS'], modifiers: ['Control'] },
        linux: { keys: ['s'], code: ['KeyS'], modifiers: ['Control'] },
      },
      targetKinds: ['pattern', 'incidental', 'text-input', 'textarea', 'contenteditable'],
      targetPolicy: { nativeText: 'allow-shell' },
      action: { type: 'app.save' },
      preventDefault: true,
    },
  ],
})
```

If a pattern owner is active, shell shortcuts run only when that active owner
declares `shellRules: { allowGlobal: true }`.

`platform` bindings are selected when route input includes
`platform: "mac" | "windows" | "linux"`. Without a platform, the base `keys`
and `modifiers` fields are used. `code` is optional and narrows a rule to a
physical key when route input includes `code`.

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
consumer smoke test for the root and React subpath.

## License

MIT. See [LICENSE](LICENSE).
