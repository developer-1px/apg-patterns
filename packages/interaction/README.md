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

## React Example

```tsx
import {
  InteractionProvider,
  useInteractionKeyboardHandler,
  useInteractionOwner,
} from '@interactive-os/interaction/react'

function FilesTree() {
  useInteractionOwner(
    {
      id: 'files.tree',
      kind: 'pattern',
      ownsKey: (input) => input.key.startsWith('Arrow'),
      restoreTarget: { kind: 'active-cursor', label: 'Files' },
    },
    { active: true },
  )

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
