---
type: research
status: current
date: 2026-05-26
title: Interaction Declarative Interface References
---

# Interaction Declarative Interface References

## Research Question

Which de facto declarative interfaces should inform a serializable `InteractionOwnerDefinition` for keyboard routing, focus ownership, active cursor protection, temporary owner restore, and shell shortcuts?

## Judgment

The useful precedent is not "everything must be JSON and no code can exist." The useful precedent is:

```txt
serializable declaration
-> deterministic matcher / router
-> implementation table or adapter boundary
-> replayable diagnostics
```

Callbacks can exist only after the declaration has already produced an inspectable route decision. If callbacks are the source of truth, the package can test examples but cannot prove the interaction contract.

## Selection

Adopt the low-side-effect primitives, not the whole historical API shape.

Use as normative baseline:

- APG composite focus model: role, movement keys, active item, roving `tabindex`, `aria-activedescendant`, focus persistence.
- UI Events key values: standard `KeyboardEvent.key` names for semantic APG movement.

Use as architecture:

- XState-style split: serializable descriptors first, runtime implementation map second.
- VS Code/Theia-style keybinding records: `key`, `command/action`, `when`, platform override, and diagnostics.

Use as vocabulary only:

- React Aria/Floating UI/Ariakit focus lifecycle terms: containment, initial focus, return focus, restore focus, guards, active-item movement, composite handoff.
- React Hotkeys Hook/Mousetrap target-policy lesson: native text-entry targets own text keys unless a rule explicitly opts in.

Do not adopt:

- VS Code `when` clause string grammar as-is.
- Registration order or "last rule wins" as the primary precedence model.
- Callback predicates such as `ownsKey(event)` or `ignoreEventWhen(event)` as the contract.
- `return false` semantics that secretly combine command result, `preventDefault`, and propagation control.
- General-purpose focus trapping as shell ownership.
- Implicit composite handoff that changes ownership without a declared restore target.

The selected shape is therefore:

```txt
standards vocabulary
-> serializable owner definition
-> structured conditions
-> explicit priority
-> explicit target policy
-> explicit focus lifecycle
-> runtime implementation map
-> replayable diagnostics
```

## Reference Map

### VS Code Keybindings

References:

- https://code.visualstudio.com/docs/configure/keybindings
- https://code.visualstudio.com/api/references/contribution-points#contributes.keybindings
- https://code.visualstudio.com/api/references/when-clause-contexts

Declarative surface:

- `key`
- `command`
- optional `when`
- optional platform-specific key fields
- optional command arguments in extension contribution points

Important behavior:

- Key rules are data records, not inline event handlers.
- A `when` clause is evaluated against current context keys.
- Rule order and first-match behavior define deterministic precedence.
- Commands are implementation identifiers, so keybinding data can be listed, inspected, edited, and diagnosed independently from command execution.

Implication:

- `InteractionOwnerDefinition` should model key ownership as `key + action/command + when + priority`, not as `ownsKey(event)`.
- The package should expose route diagnostics similar to "which rule matched and why."
- Context keys should be a small explicit vocabulary, not arbitrary JavaScript predicates as the primary interface.

### Theia Commands, Menus, and Keybindings

Reference:

- https://theia-ide.org/docs/commands_keybindings/

Declarative surface:

- keybinding contribution records with `keybinding`, `command`, and optional `when`
- command objects with stable `id`
- command handlers registered separately

Important behavior:

- Theia follows VS Code terminology for `when` clauses.
- A command is a stable action identity; handlers supply runtime behavior.
- Keybindings can be context-sensitive without embedding the command implementation into the keybinding record.

Implication:

- The shell-facing API should allow owners to declare command identities even when the host app supplies the command implementation.
- This supports APG demos, Hub, and future products sharing the same route matrix while binding different effects.

### XState Guards and Actions

References:

- https://stately.ai/docs/guards
- https://stately.ai/docs/actions

Declarative surface:

- state machine config
- transition records
- guard references as strings or `{ type, params }`
- action objects as `{ type, params }`

Runtime boundary:

- `setup({ guards, actions })` or `.provide(...)` supplies implementations.
- Inline functions exist, but the docs recommend serialized guards and action objects for reuse and visualization.

Important behavior:

- A declarative config can be visualized and simulated.
- Runtime implementations are named capabilities, not the primary model.
- Guard order and transition order are deterministic.

Implication:

- `InteractionOwnerDefinition` should use serializable condition/action descriptors:

```ts
type InteractionCondition =
  | { type: "target.kind"; equals: "native-input" | "apg-composite" | "scroll-region" }
  | { type: "owner.kind"; equals: string }
  | { type: "owner.mode"; equals: string }
  | { type: "key.modifier"; includes: "Alt" | "Control" | "Meta" | "Shift" };
```

- Runtime predicates can be provided through a separate implementation map, but they should not replace the built-in descriptor set for common cases.

### CodeMirror Keymaps

Reference:

- https://codemirror.net/docs/ref/#view.KeyBinding

Declarative surface:

- key binding objects with `key`, platform-specific key fields, `scope`, `preventDefault`, and `stopPropagation`
- keymap facet registering arrays of bindings

Runtime boundary:

- `run`, `shift`, and `any` are functions.

Important behavior:

- Bindings are scoped.
- Precedence is determined by keymap priority/order.
- A handled key stops later handlers.
- Event policy such as `preventDefault` and `stopPropagation` is encoded in the binding record.

Implication:

- It is acceptable for our final adapter to call functions, but the routeable contract needs serializable key rule records.
- `scope`, `preventDefault`, `stopPropagation`, and "handled/yielded" should be explicit route outputs.

### React Hotkeys Hook

Reference:

- https://react-hotkeys-hook.vercel.app/docs/api/use-hotkeys

Declarative surface:

- key strings
- options such as `enabled`, `scopes`, `preventDefault`, `enableOnFormTags`, `enableOnContentEditable`, `description`, `keyup`, and `keydown`

Runtime boundary:

- The callback is executable behavior.
- Some options accept functions for fine-grained filtering.

Important behavior:

- Global shortcuts need explicit scope.
- Form controls and contenteditable targets are excluded by default unless explicitly enabled.
- The hook keeps descriptive metadata for shortcuts.

Implication:

- Our owner definitions need `targetPolicy` or equivalent:

```txt
native text entry owns text keys by default
global shortcut may run only when owner allows it
owner key may run only when target policy permits it
```

- Documentation/diagnostics metadata should be part of the key rule, not an afterthought.

### Mousetrap

Reference:

- https://craig.is/killing/mice

Declarative surface:

- key strings, key combinations, and key sequences

Runtime boundary:

- callback functions
- overridable `stopCallback`

Important behavior:

- Shortcuts are ignored in `input`, `select`, `textarea`, and `contenteditable` by default.
- Returning `false` from a callback prevents default behavior and stops bubbling.
- Element-scoped instances exist.

Implication:

- Even older shortcut libraries encode the same concern: native text-entry targets must not be accidentally stolen by global key handlers.
- The modern package should make this target filtering serializable instead of hiding it in `stopCallback`.

### React Aria FocusScope

Reference:

- https://react-aria.adobe.com/FocusScope

Declarative surface:

- `contain`
- `restoreFocus`
- `autoFocus`

Runtime boundary:

- `useFocusManager` exposes imperative focus movement.

Important behavior:

- Focus containment, focus restore, and initial focus are distinct options.
- Arrow-key movement can be implemented by asking a scope-local focus manager to move focus.

Implication:

- `InteractionOwnerDefinition` should not collapse focus into key handling.
- Focus lifecycle needs a serializable section:

```txt
focus
|-- containment: none | modal | local
|-- strategy: roving-tabindex | aria-activedescendant | dom-focus
|-- initial: first | selected | last-active | invoker | explicit-id
`-- restore: previous-owner | invoker | active-cursor | explicit-id | none
```

### Floating UI FloatingFocusManager

Reference:

- https://floating-ui.com/docs/floatingfocusmanager

Declarative surface:

- `initialFocus`
- `returnFocus`
- `restoreFocus`
- `guards`
- `modal`
- `outsideElementsInert`
- `closeOnFocusOut`
- `order`

Runtime boundary:

- refs and `getInsideElements` are runtime adapters.

Important behavior:

- Return focus and restore focus are separate.
- Focus guards are an explicit behavior flag.
- Modal and non-modal focus management differ.
- Combobox behavior requires special handling because DOM focus and popup accessibility focus are not the same problem.

Implication:

- Our owner model needs separate restore concepts:

```txt
returnFocus: where ownership returns when temporary owner closes
restoreFocus: what to do when the current focused node disappears
guardFocus: whether incidental focus is corrected before key routing breaks
```

### Ariakit Composite

Reference:

- https://ariakit.com/reference/composite

Declarative surface:

- `composite`
- `focusOnMove`
- `moveOnKeyPress`
- `accessibleWhenDisabled`

Important behavior:

- A composite can intentionally stop managing focus and keyboard navigation when another composite takes over.
- Moving the active item and applying DOM/virtual focus are separate behaviors.
- Disabled-but-discoverable items can remain focusable in composite contexts.

Implication:

- The owner definition should support explicit handoff:

```txt
owner A yields composite responsibility to owner B
owner A still exists but does not interpret movement keys
owner B declares how to restore owner A
```

- `active cursor movement` and `DOM focus movement` must be independently represented.

### WAI-ARIA APG Keyboard Interface

Reference:

- https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/

Declarative surface:

- role-backed keyboard conventions
- composite focus strategies
- focus persistence guidance
- roving `tabindex`
- `aria-activedescendant`

Important behavior:

- `Tab` and `Shift+Tab` move between components.
- Arrow keys usually move inside composites.
- Only one focusable element of a composite should normally be in the tab sequence.
- Focus and selection are different.
- When DOM removal would lose focus, authors must restore focus logically.

Implication:

- This is the strongest reason serialization matters in this package. APG behavior is a contract that should be inspectable:

```txt
role -> focus strategy -> movement keys -> active item -> restore rule
```

- A scroll region accidentally receiving DOM focus should not silently become the owner of tree arrow keys unless a declared handoff says so.

### UI Events Key Values

Reference:

- https://www.w3.org/TR/uievents-key/

Declarative surface:

- standard `KeyboardEvent.key` value names
- standard `KeyboardEvent.code` names for physical keys

Implication:

- APG movement rules should primarily use `KeyboardEvent.key` names such as `ArrowDown`, `Escape`, `Enter`, `Home`, and `End`.
- Layout-independent app shortcuts may need an optional `code` path, but that should be separate from APG semantic movement.

## Derived Interface Direction

The de facto target shape is:

```txt
InteractionOwnerDefinition
|-- id: stable owner id
|-- kind: tree | listbox | menu | toolbar | dialog | input | scroll-region | custom
|-- priority: deterministic owner order
|-- scope: shell / region / modal / local owner scope
|-- focus
|   |-- strategy
|   |-- containment
|   |-- initial
|   |-- restore
|   `-- guard
|-- keyRules[]
|   |-- id
|   |-- keys / code / modifiers
|   |-- when
|   |-- targetPolicy
|   |-- action
|   |-- preventDefault
|   `-- stopPropagation
|-- shellRules
|   |-- allowGlobal
|   `-- blockGlobalWhen
`-- diagnostics
    |-- label
    |-- source
    `-- intent
```

Runtime adapters then bind effects:

```txt
InteractionRuntimeBinding
|-- ownerId
|-- commandHandlers
|-- conditionHandlers
|-- resolveElement
|-- focusElement
`-- restoreElement
```

## Verification Model

If the definition is serializable, normal operation can be checked without a browser-specific full app run:

```txt
schema validation
-> compile definition
-> generate route matrix
-> replay key traces
-> snapshot diagnostics
-> adapter smoke tests
```

Concrete checks:

- Schema check: invalid keys, unknown restore targets, unsupported focus strategy/role combinations.
- Route matrix: for each owner, target kind, key, and context, compute `owner | native | shell | blocked | restore`.
- Conflict detection: two owners claim the same key in the same scope with equal priority.
- Native target policy: form fields and contenteditable own text input unless a rule explicitly opts in.
- Focus guard replay: scroll region, removed active element, and incidental focus targets produce expected restore decisions.
- APG replay fixtures: tree/listbox/menu/grid/dialog examples assert active cursor and DOM focus projection.
- Adapter tests: callbacks are only checked after the compiled declaration has already selected the route.

## Non-Goals

- Do not copy a full VS Code command registry.
- Do not require all host effects to be serializable.
- Do not make `@interactive-os/aria` depend on this package.
- Do not hide ownership decisions in React hooks.
- Do not let callback predicates become the normative contract for APG behavior.

## Decision

`@interactive-os/interaction` should move toward definition-first ownership:

```txt
definition is the contract
compiled route is the testable behavior
adapter is the effect boundary
diagnostics explain every route
```

This gives the package a way to answer the core verification question: normal behavior is checked by compiling and replaying serializable definitions, not by trusting opaque event callbacks.
