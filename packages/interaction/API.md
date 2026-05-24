# @interactive-os/interaction API Reference

This file lists the package entrypoints and public export names.

## Entrypoints

```ts
import { routeInteractionKey } from '@interactive-os/interaction'
import { InteractionProvider } from '@interactive-os/interaction/react'
```

- `@interactive-os/interaction`: React-free core.
- `@interactive-os/interaction/react`: React provider and hooks.
- `@interactive-os/interaction/package.json`: package metadata.

## Root Exports

```txt
classifyInteractionKeyTarget
createInteractionDiagnosticsSnapshot
createInteractionOwnershipRegistry
describeInteractionDomFocus
evaluateInteractionFocusGuard
evaluateInteractionFocusTarget
handleInteractionKeyboardEvent
interactionKeyInputFromKeyboardEvent
matchInteractionKeyRule
resolveInteractionRestoreTarget
routeInteractionKey
routeInteractionKeyboardEvent
```

## Root Type Exports

```txt
HandleInteractionKeyboardEventOptions
InteractionDiagnosticsOptions
InteractionDiagnosticsSnapshot
InteractionDomFocusSnapshot
InteractionFocusGuardAction
InteractionFocusGuardInput
InteractionFocusGuardReason
InteractionFocusGuardResult
InteractionKeyInput
InteractionKeyboardEventLike
InteractionKeyboardEventRoute
InteractionKeyboardRouteCallback
InteractionKeyRule
InteractionKeyRuleKind
InteractionKeyTargetKind
InteractionMatchedKeyRule
InteractionOwner
InteractionOwnerDiagnostics
InteractionOwnerId
InteractionOwnerKind
InteractionOwnershipRegistry
InteractionOwnershipSnapshot
InteractionRestoreInput
InteractionRestoreReason
InteractionRestoreTarget
InteractionRestoreTargetKind
InteractionRestoreTargetResolver
InteractionRouteReason
InteractionRouteResult
InteractionRouteStatus
```

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
