# @interactive-os/interaction API Reference

This file is the public API contract for `@interactive-os/interaction`.

The package coordinates keyboard and focus ownership in application shells. It
does not implement APG widgets, execute app commands, or move DOM focus by
itself. The public contract is:

```txt
serializable owner definition
-> compiled runtime owner
-> registry ownership state
-> route or focus-guard decision
-> host-owned effect
```

## Entrypoints

```ts
import {
  createInteractionRouter,
  temporaryControl,
} from '@interactive-os/interaction/runtime'
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction/definition'
import { createApgInteractionOwner } from '@interactive-os/interaction/apg'
import { InteractionProvider } from '@interactive-os/interaction/react'
```

- `@interactive-os/interaction/runtime`: React-free and Zod-free runtime
  primitives, shortcut owners, typed action helpers, unchecked compile, routing,
  focus guard, event adapter, and diagnostics.
- `@interactive-os/interaction/definition`: Zod schemas, validation helpers,
  and checked compile for serializable definitions.
- `@interactive-os/interaction/apg`: React-free and Zod-free APG structural
  adapter for turning APG pattern keyboard contracts into interaction owners.
- `@interactive-os/interaction`: compatibility aggregate. It remains
  React-free, but bundle-sensitive consumers should import from the runtime or
  definition subpath directly. Root and definition imports load Zod-backed
  schema code; production runtime code should import the runtime subpath.
- `@interactive-os/interaction/react`: optional React provider and hooks.
- `@interactive-os/interaction/package.json`: package metadata.

## Workflow Contract

### 1. Start With Runtime Shortcuts

Use runtime shortcuts when app code only needs to say which owner handles a few
keys. This path does not import Zod. A command palette starts closed: the shell
shortcut opens it, then the palette temporarily owns its local keys.

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

const palette = temporaryControl<PaletteActions>({
  id: 'nano.command-palette',
  restore: [{ key: 'Escape', action: 'palette.close' }],
  keys: {
    ArrowDown: { action: { type: 'palette.move', params: { delta: 1 } } },
    ArrowUp: { action: { type: 'palette.move', params: { delta: -1 } } },
    Enter: 'palette.run',
  },
})

const shell = shellOwner<PaletteActions>({
  id: 'nano.shell',
  allowNativeText: true,
  keys: [{ key: 'k', code: 'KeyK', mod: 'primary', action: 'palette.open' }],
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

Shortcut contract:

- `temporaryControl` creates a runtime owner with command keys and restore
  keys. Command palettes, slash menus, popovers, and cell editors fit here.
- `shellOwner` creates a shell owner for app-level shortcuts.
- `mod: 'primary'` maps to Meta on macOS and Control on Windows/Linux when the
  route input has a platform. Without a platform, the fallback binding is
  Control; macOS apps should pass `platform: 'mac'` or use
  `detectInteractionPlatform()`.
- `createInteractionRouter` owns a registry and forwards `platform` to route
  and DOM-event helpers.
- Shortcut helpers compile down to the same `InteractionOwner` primitive used
  by the lower-level registry.
- `restore: ['Escape']` creates a restore route. `restore: [{ key, action }]`
  also exposes a typed close action.
- `allowNativeText: true` lets a shell shortcut open from inputs and editors.

### 2. Define

Use `InteractionOwnerDefinitionSchema`, `defineInteractionOwner`, or
`defineInteractionOwners` to validate serializable owner definitions.

Definition schemas are strict. Unknown fields such as callback functions are
rejected by Zod. Action params must be `InteractionSerializableValue`.

```ts
import { defineInteractionOwner } from '@interactive-os/interaction/definition'

const treeDefinition = defineInteractionOwner({
  id: 'files.tree',
  kind: 'tree',
  focus: {
    strategy: 'aria-activedescendant',
    restore: { kind: 'active-cursor', label: 'Files tree' },
  },
  keyRules: [
    {
      id: 'tree.next',
      kind: 'navigation',
      keys: ['ArrowDown'],
      targetKinds: ['pattern', 'scroll-container', 'incidental'],
      action: { type: 'tree.move', params: { direction: 'next' } },
      preventDefault: true,
    },
  ],
})
```

`InteractionOwnerDefinition` fields:

```txt
id: stable owner id
kind: declared owner kind, such as tree, listbox, input, shell
runtimeKind: optional override for pattern | temporary-control | shell
priority: numeric order used by compileInteractionOwnerDefinitions
scope: shell | region | modal | local
mode: optional current owner mode for structured conditions
focus: focus lifecycle declaration
keyRules: keyboard route declarations
shellRules: whether an active owner yields to shell shortcuts
diagnostics: label, role, source, and intent metadata
```

`InteractionKeyRuleDefinition` fields:

```txt
id: stable rule id
kind: navigation | command | restore | shell | custom
keys: KeyboardEvent.key values
code: optional KeyboardEvent.code values for physical-key narrowing
modifiers: Alt | Control | Meta | Shift
platform: optional mac/windows/linux key and modifier override
targetKinds: target classes the rule may match
targetPolicy: explicit exceptions to native target protection
when: structured condition tree
action: serializable effect descriptor for the host
preventDefault: event policy consumed by handleInteractionKeyboardEvent
stopPropagation: event policy consumed by handleInteractionKeyboardEvent
```

`targetPolicy` is opt-in. Native text entry is protected unless a matching
rule explicitly declares `nativeText: 'allow-owner'` or
`nativeText: 'allow-shell'`.

Runtime field consumption:

```txt
id: registry identity
kind/runtimeKind: runtime owner kind
priority: ordering in compileInteractionOwnerDefinitions
mode: evaluated by owner.mode conditions
focus.strategy: copied to owner diagnostics
focus.restore: runtime restore target
focus.initial / focus.containment / focus.guard: validated declaration
keyRules.keys / code / modifiers / platform / targetKinds / when: route match
keyRules.action: exposed on matched route
keyRules.preventDefault / stopPropagation: consumed by event adapter
targetPolicy.nativeText / nativeControl: native route exception
targetPolicy.incidental / scroll: validated declaration
shellRules: shell shortcut yield policy
diagnostics.label / role: copied to owner diagnostics
diagnostics.source / intent: validated declaration
```

### 3. Compile

Use `compileInteractionOwnerDefinition` from the definition entrypoint to
validate a serializable definition and adapt it to the current runtime
`InteractionOwner` interface.

```ts
import { compileInteractionOwnerDefinition } from '@interactive-os/interaction/definition'

const owner = compileInteractionOwnerDefinition(treeDefinition)
```

Use `createInteractionOwner` or `compileInteractionOwnerUnchecked` from the
runtime entrypoint when the definition is trusted static app code and has
already been validated in dev/test.

```ts
import { createInteractionOwner } from '@interactive-os/interaction/runtime'

const owner = createInteractionOwner({
  id: 'files.tree',
  kind: 'tree',
  keyRules: [{
    id: 'tree.next',
    kind: 'navigation',
    keys: ['ArrowDown'],
    action: { type: 'tree.move', params: { direction: 'next' } },
  }],
})
```

Compilation contract:

- `shell` compiles to runtime kind `shell`.
- `input`, `form`, `editor`, `dialog`, `popover`, `native-control`, and
  `temporary-control` compile to runtime kind `temporary-control`.
- Every other definition kind currently compiles to runtime kind `pattern`.
- `focus.restore` becomes the runtime restore target.
- `focus.restore` values `first`, `selected`, and `last-active` are normalized
  to runtime restore target kind `active-cursor`.
- `keyRules` become diagnostic key rules used by route results.
- `keyRules.kind === 'restore'` becomes `restoreKeys`.
- `shellRules.allowGlobal === true` lets an active owner yield to shell
  shortcuts unless `shellRules.blockWhen` matches.

Use `compileInteractionOwnerDefinitions` when registering multiple untrusted
definitions. It validates the array, rejects duplicate owner ids, sorts by
`priority` ascending, and compiles each definition.

Use `compileInteractionOwnersUnchecked` when the same array is trusted static
code and runtime bundle size matters.

### 4. Register And Activate

Use `createInteractionOwnershipRegistry` to create runtime ownership state.

```ts
const registry = createInteractionOwnershipRegistry()
const unregister = registry.register(owner)
registry.activate(owner.id)
```

Registry contract:

- `register(owner)` stores an owner and returns an unregister function.
- Duplicate owner ids throw.
- `activate(ownerId)` makes that owner active.
- Activating a `temporary-control` pushes the previous active owner onto the
  return stack.
- Activating a non-temporary owner clears the return stack.
- `release(ownerId, reason)` restores the last still-registered return owner.
- If the restored owner has `restore`, `release` calls it with the resolved
  restore target.
- Unregistering the active owner releases it with reason `remove`.

### 5. Route Keys

Use `routeInteractionKey` for pure route decisions. It does not mutate the
registry or the DOM.

```ts
const route = routeInteractionKey(registry, {
  key: 'ArrowDown',
  code: 'ArrowDown',
  targetKind: 'scroll-container',
})
```

Route statuses:

```txt
owner: a pattern, temporary owner, or shell owner owns the key
restore: a temporary owner restore key matched
native: browser/native behavior should continue
ignored: no owner handled the key
```

Route reasons:

```txt
active-owner-handled: active owner matched the key
temporary-owner-restore-requested: active temporary owner matched restore
shell-owner-handled: shell owner matched the key
native-target-protected: text/native target kept ownership
active-owner-yielded: active owner allowed shell, but no shell matched
no-owner: no active owner and no shell owner matched
browser-fallback: no owner route should intercept the key
```

When a key rule matches, `route.matchedKeyRule` includes the matched rule id,
key, optional code, kind, label, `action`, `preventDefault`, and
`stopPropagation`.

Shell routing rules:

- With no active owner, shell owners may handle non-native targets.
- With no active owner and a native text target, a shell owner must also
  satisfy `targetPolicy.nativeText: 'allow-shell'`.
- With an active owner, shell shortcuts run only when that active owner allows
  shell keys. Compiled definitions express this with
  `shellRules: { allowGlobal: true }`.

### 6. Handle Keyboard Events

Use `interactionKeyInputFromKeyboardEvent` to normalize an event-like object
into `InteractionKeyInput`.

Use `routeInteractionKeyboardEvent` to route without side effects.

Use `handleInteractionKeyboardEvent` when the host wants the package to apply
event policy and call status callbacks.

```ts
handleInteractionKeyboardEvent({
  registry,
  event,
  releaseOnRestore: true,
  onOwnerKey({ route }) {
    dispatch(route.matchedKeyRule?.action)
  },
})
```

Event adapter contract:

- `targetKind` is derived with `classifyInteractionKeyTarget`.
- `classifyInteractionKeyTarget` is safe when DOM constructors such as
  `Element` are not installed globally; unknown targets fall back to
  `targetKind: 'unknown'`.
- `code` is forwarded when the event-like object provides it.
- `platform` is forwarded from the event-like object, adapter options, or a
  `resolvePlatform` callback.
- `detectInteractionPlatform` reads navigator-like platform/user-agent strings
  and returns `mac`, `windows`, `linux`, or `undefined`.
- If `shouldPreventDefault` is provided, it wins.
- Otherwise matched `preventDefault` wins.
- Otherwise `owner` and `restore` routes prevent default.
- If `shouldStopPropagation` is provided, it wins.
- Otherwise matched `stopPropagation: true` stops propagation.
- `releaseOnRestore: true` calls `registry.release(route.ownerId)`.

Typed action dispatch:

```ts
import { createInteractionActions } from '@interactive-os/interaction/runtime'

type PaletteActions = {
  'palette.close': void
  'palette.move': { delta: number }
  'palette.run': void
}

const actions = createInteractionActions<PaletteActions>()

declare function movePaletteCursor(delta: number): void

handleInteractionKeyboardEvent({
  registry,
  event,
  onOwnerKey({ route }) {
    const move = actions.getRoute(route, 'palette.move')
    if (move) movePaletteCursor(move.params.delta)
  },
})
```

Use `actions.getRoute(route, type)` when starting from a route result. Use
`actions.get(action, type)` when starting from `route.matchedKeyRule?.action`.
Actions declared as `void` do not expose `params`.

### 7. Guard Focus

Use `evaluateInteractionFocusGuard` for pure focus guard decisions.

Use `evaluateInteractionFocusTarget` when starting from a DOM event target.

Focus guard contract:

- It does not mutate registry state or DOM focus.
- It restores active pattern ownership for incidental and scroll-container
  focus targets.
- It allows native focus targets such as inputs, textareas, selects,
  contenteditable nodes, and native controls.
- It activates a declared target owner when `targetOwnerId` names a registered
  owner.

### 8. Diagnose

Use `createInteractionDiagnosticsSnapshot` to collect the current active owner,
owner stack, return stack, restore target, DOM focus classification, route
summary, and focus guard summary.

Diagnostics are read-only. They are safe to log, snapshot, or show in demos.

### 9. Bridge APG Pattern Contracts

Use `defineApgInteractionOwner` or `createApgInteractionOwner` when an APG
pattern runtime already owns local keyboard behavior and the shell only needs
ownership routing.

The bridge accepts an APG-shaped structural contract. It does not import
`@interactive-os/aria`, so dependency direction stays one-way: shells and
interaction code can consume APG contracts, but `@interactive-os/aria` does not
depend on `@interactive-os/interaction`.

```ts
import {
  createApgInteractionOwner,
} from '@interactive-os/interaction/apg'
import {
  createInteractionRouter,
} from '@interactive-os/interaction/runtime'

const treeOwner = createApgInteractionOwner({
  id: 'files.tree',
  label: 'Files',
  definition: {
    apgPattern: 'treeview',
    rootRole: 'tree',
    focusModel: 'ariaActiveDescendant',
    keyboard: [
      { shortcut: 'ArrowDown', cases: [{ events: [{ type: 'navigate' }] }] },
      { shortcut: 'ArrowUp', cases: [{ events: [{ type: 'navigate' }] }] },
    ],
  },
})

const router = createInteractionRouter({
  owners: [treeOwner],
  activeOwnerId: treeOwner.id,
})
```

Bridge contract:

- APG `focusModel: "rovingTabIndex"` maps to interaction
  `focus.strategy: "roving-tabindex"`.
- APG `focusModel: "ariaActiveDescendant"` maps to interaction
  `focus.strategy: "aria-activedescendant"`.
- APG keyboard bindings become routeable interaction key rules.
- Pattern keys are claimable from `pattern`, `scroll-container`, and
  `incidental` targets by default.
- Native text entry remains protected by default.
- The generated route action defaults to `<apgPattern>.keyboard` with
  `apgPattern`, `rootRole`, and `shortcut` metadata.

### 10. Use React Adapters

The React subpath is optional.

```tsx
import {
  InteractionProvider,
  useInteractionKeyboardHandler,
  useInteractionOwner,
} from '@interactive-os/interaction/react'
```

React contract:

- `InteractionProvider` supplies an ownership registry.
- `useInteractionOwner(owner, { active })` registers an already-created
  `InteractionOwner`; use `compileInteractionOwnerDefinition` before passing a
  declarative definition to the hook.
- `useInteractionKeyboardHandler(options)` wraps `handleInteractionKeyboardEvent`.
- `useInteractionFocusGuardHandler(options)` wraps focus target evaluation.
- React is not imported by the root entrypoint.

## Host Responsibilities

The host application owns all effects:

- Dispatch `route.matchedKeyRule?.action`.
- Move DOM focus to the resolved restore target.
- Connect APG pattern state changes to the declared action descriptors.
- Supply `platform` through route input, adapter options, or
  `createInteractionRouter` when platform-specific key bindings matter.
- Register and unregister owners with the component or shell lifecycle.
- Decide how diagnostics are logged or displayed.

The package owns decisions, not app effects.

## Anti-Patterns

- Do not put callback functions inside `InteractionOwnerDefinition`.
- Do not rely on shell shortcuts inside text inputs without an explicit
  `targetPolicy` or shortcut `allowNativeText`.
- Do not treat DOM focus as the only ownership signal in composite shells.
- Do not route keys from React hooks before registering the intended owner.
- Do not put APG structural adapters in the core runtime entrypoint.
- Do not import React from the root entrypoint.
- Do not make `@interactive-os/interaction` a dependency of
  `@interactive-os/aria`.

## Runtime Exports

```txt
classifyInteractionKeyTarget
compileInteractionCommandBindings
compileInteractionCommandDefinitions
defineInteractionCommandDefinitions
compileInteractionOwnerUnchecked
compileInteractionOwnersUnchecked
createInteractionActions
createInteractionDiagnosticsSnapshot
createInteractionOwner
createInteractionOwnershipRegistry
createInteractionRouter
detectInteractionPlatform
describeInteractionDomFocus
evaluateInteractionCondition
evaluateInteractionFocusGuard
evaluateInteractionFocusTarget
formatInteractionCommandBinding
formatInteractionCommandKeyboardShortcut
formatInteractionCommandPointerInput
getInteractionCommandBindingSummary
getInteractionCommandMapping
getInteractionAction
getInteractionRouteAction
handleInteractionKeyboardEvent
interactionKeyInputFromKeyboardEvent
isInteractionAction
matchInteractionKeyRule
resolveInteractionPrimaryModifier
resolveInteractionRestoreTarget
routeInteractionKey
routeInteractionKeyboardEvent
shellOwner
temporaryControl
```

## Runtime Type Exports

```txt
HandleInteractionKeyboardEventOptions
InteractionActionDescriptor
InteractionActionDescriptorFor
InteractionActionHelpers
InteractionActionMap
InteractionActionOf
InteractionActionRouteLike
InteractionCommandBindingDefinition
InteractionCommandBindingSummaryInput
InteractionCommandCompiledBinding
InteractionCommandDefinition
InteractionCommandKeyboardShortcutDefinition
InteractionCommandLabelOptions
InteractionCommandMapping
InteractionCommandPointerInputDefinition
InteractionCommandShortcutModifier
InteractionCondition
InteractionDefinitionKeyInput
InteractionDiagnosticsOptions
InteractionDiagnosticsSnapshot
InteractionDomFocusSnapshot
InteractionFocusContainment
InteractionFocusDefinition
InteractionFocusGuardAction
InteractionFocusGuardPolicy
InteractionFocusGuardInput
InteractionFocusGuardReason
InteractionFocusGuardResult
InteractionFocusStrategy
InteractionFocusTarget
InteractionKeyAction
InteractionKeyInput
InteractionKeyboardEventLike
InteractionKeyboardEventRoute
InteractionKeyboardRouteCallback
InteractionKeyboardEventInputOptions
InteractionKeyModifier
InteractionKeyPlatformRule
InteractionKeyRule
InteractionKeyPlatformBinding
InteractionKeyRuleDefinition
InteractionKeyRuleKind
InteractionKeyTargetKind
InteractionMatchedKeyRule
InteractionOwner
InteractionOwnerDefinition
InteractionOwnerDefinitionKind
InteractionOwnerDiagnostics
InteractionOwnerDiagnosticsDefinition
InteractionOwnerId
InteractionOwnerKind
InteractionOwnerRuntimeKind
InteractionOwnerScope
InteractionOwnershipRegistry
InteractionOwnershipSnapshot
InteractionPlatform
InteractionRestoreInput
InteractionRestoreReason
InteractionRestoreTarget
InteractionRestoreTargetKind
InteractionRestoreTargetResolver
InteractionRouteReason
InteractionRouteResult
InteractionRouteStatus
InteractionRouter
InteractionRouterOptions
InteractionSerializableValue
InteractionShellOwnerOptions
InteractionShellRulesDefinition
InteractionShortcutAction
InteractionShortcutBinding
InteractionShortcutKeyMap
InteractionShortcutList
InteractionShortcutModifier
InteractionShortcutOwnerOptions
InteractionTargetPolicy
InteractionTemporaryControlOptions
```

## APG Bridge Exports

```txt
createApgInteractionOwner
defineApgInteractionOwner
```

## APG Bridge Type Exports

```txt
ApgInteractionEventTemplate
ApgInteractionFocusModel
ApgInteractionKeyboardBinding
ApgInteractionKeyboardCase
ApgInteractionOwnerOptions
ApgInteractionPatternDefinition
```

## Definition Exports

```txt
InteractionActionDescriptorSchema
InteractionConditionSchema
InteractionFocusContainmentSchema
InteractionFocusDefinitionSchema
InteractionFocusGuardPolicySchema
InteractionFocusStrategySchema
InteractionFocusTargetSchema
InteractionKeyModifierSchema
InteractionKeyPlatformBindingSchema
InteractionKeyRuleDefinitionSchema
InteractionKeyRuleKindSchema
InteractionKeyTargetKindSchema
InteractionOwnerDefinitionKindSchema
InteractionOwnerDefinitionSchema
InteractionOwnerDefinitionsSchema
InteractionOwnerDiagnosticsDefinitionSchema
InteractionOwnerRuntimeKindSchema
InteractionOwnerScopeSchema
InteractionPlatformSchema
InteractionSerializableValueSchema
InteractionShellRulesDefinitionSchema
InteractionTargetPolicySchema
compileInteractionOwnerDefinition
compileInteractionOwnerDefinitions
defineInteractionOwner
defineInteractionOwners
evaluateInteractionCondition
```

The definition entrypoint also exports the definition-related types listed
under runtime type exports.

## Root Compatibility Exports

The root entrypoint re-exports the runtime surface plus the definition schemas
and checked definition helpers. It is kept for compatibility; new
bundle-sensitive runtime code should import from `@interactive-os/interaction/runtime`.

## React Exports

```txt
InteractionProvider
useInteractionFocusGuardHandler
useInteractionKeyboardHandler
useInteractionOwner
useInteractionRegistry
```

## React Type Exports

```txt
InteractionFocusGuardCallback
InteractionProviderProps
UseInteractionFocusGuardHandlerOptions
UseInteractionKeyboardHandlerOptions
UseInteractionOwnerOptions
```

## Validation

Before treating public API contract changes as complete, run:

```bash
npm run check:interaction
npm run check:independence
npm run typecheck
```
