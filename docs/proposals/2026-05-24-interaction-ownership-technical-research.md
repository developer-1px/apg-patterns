---
type: research
status: current
date: 2026-05-24
title: Interaction Ownership Technical Research
---

# Interaction Ownership Technical Research

## Research Question

What should `@interactive-os/interaction` own when an application shell combines trees, listboxes, menus, toolbars, dialogs, forms, scroll regions, custom keys, and global keys?

## Judgment

The package should not be a global keydown hijacker, a shortcut library, or a generic focus-trap utility. The established path across standards and de facto libraries is scoped ownership:

```txt
keyboard event
-> current context / scope
-> key binding priority
-> owner handles or yields
-> focus or active-cursor projection
-> explicit restore when temporary ownership ends
```

`@interactive-os/interaction` should be the shell-level ownership layer that coordinates those scopes. It should protect role-backed APG composites from accidental native focus theft while still allowing explicit temporary ownership for inputs, editors, popups, dialogs, and browser-native controls.

## Problem Frame

The target shell is not a single widget. It is a composed surface:

```txt
shell
├─ tree / list / menu / toolbar / grid
├─ dialogs and popovers
├─ inputs, forms, editors, and native controls
├─ scroll containers
├─ custom component-level keys
└─ global application keys
```

The failure mode is that browser focus can move to an incidental focusable target while the user's logical keyboard context is still inside a role-backed APG component.

Examples:

- a tree has an active cursor, but a scroll container becomes the active key target
- a role-backed list or menu contains an action surface that steals DOM focus and starts receiving arrow keys
- a toolbar command opens an input, but closing the input does not restore the toolbar/list/tree owner
- a dialog or popover contains a nested composite, and `Escape`/`Tab`/arrow handling becomes ambiguous
- a global shortcut fires while an input or contenteditable surface should own text entry

The package should solve these as ownership conflicts, not as isolated keydown bugs.

## Standards Baseline

### UI Events

W3C UI Events defines the standard keyboard event vocabulary. `KeyboardEvent.key` expresses the user's intended key value, and the key values spec defines names such as `ArrowDown`, `Enter`, and `Escape`.

Reference:

- https://www.w3.org/TR/uievents/
- https://www.w3.org/TR/uievents-key/

Implication:

- `@interactive-os/interaction` should normalize around standard `KeyboardEvent.key` names for semantic shortcuts.
- Physical-key bindings may need a separate `code` or scan-code path for layout-independent app shortcuts, but APG pattern behavior should stay key-value oriented.

### HTML Focus, Inert, Dialog, and Popover

HTML owns the native focus model: focusable areas, sequential focus navigation, `tabindex`, `autofocus`, inert subtrees, `dialog`, and popover behavior.

References:

- https://html.spec.whatwg.org/multipage/interaction.html
- https://www.w3.org/WAI/WCAG22/Techniques/html/H102
- https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using

Implication:

- The package must treat browser focus as authoritative external state, not as an implementation detail it can ignore.
- Modal `dialog` and popover already have native focus relationships; the interaction package should compose with them rather than replacing them.
- Focus restoration must be explicit because DOM removal, popover close, dialog close, and scrollable/native focus targets can otherwise move focus to an unintended place.

### WCAG

WCAG constrains the shell outcome: keyboard operation, no keyboard trap, logical focus order, visible focus, and non-obscured focus.

Reference:

- https://www.w3.org/TR/WCAG22/

Implication:

- A focus guard must not become a trap. If a component can receive keyboard focus, the user must be able to leave it with standard keyboard navigation or a documented exit.
- Focus restoration is valid only when it preserves the user's workflow and does not create surprising context changes.
- The package should provide diagnostics for traps, lost focus, and hidden active targets.

### WAI-ARIA and APG Composite Focus

ARIA defines `aria-activedescendant` as a focus-management alternative for composite widgets. APG defines the two canonical composite strategies:

- roving `tabindex`
- container DOM focus with `aria-activedescendant`

References:

- https://www.w3.org/TR/wai-aria-1.2/#aria-activedescendant
- https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets

Implication:

- DOM focus, accessibility focus, visual focus, active cursor, and selection are distinct concepts.
- A composite's active cursor can remain inside a tree/list/grid while DOM focus is on the composite root or another temporary owner.
- `@interactive-os/interaction` needs an owner model, not just a focused-element model.

### APG Pattern Behavior

APG pattern pages document the social keyboard contracts for common widgets:

- Treeview: arrow keys move focus through visible nodes; focus and selection are distinct.
- Listbox: arrow keys move focus through options; listbox is not for options containing interactive elements.
- Toolbar: one tab stop for the toolbar; arrow keys move among toolbar controls.
- Dialog: focus is contained while open and normally returns to the invoker.
- Grid: there is an explicit distinction between grid navigation and editing/interacting inside a cell.

References:

- https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://www.w3.org/WAI/ARIA/apg/patterns/grid/

Implication:

- The package should model interaction modes, not only key handlers.
- Grid's edit/navigation split is the strongest standard reference for temporary ownership: `Enter` or `F2` can hand ownership to an input/widget, and `Escape` or `F2` can restore grid navigation.
- This same ownership idea generalizes to tree + filter input, listbox + toolbar, menu + search input, scroll container + composite root, and dialog + nested composite.

## De Facto Library Survey

### React Aria

React Aria separates keyboard interaction hooks from focus scope utilities:

- `useKeyboard` handles keyboard interactions and uses explicit propagation control.
- `FocusScope` contains focus, restores focus on unmount, auto focuses children, and exposes `useFocusManager` for programmatic movement.

References:

- https://react-spectrum.adobe.com/react-aria/
- https://react-spectrum.adobe.com/react-aria/useKeyboard.html
- https://react-spectrum.adobe.com/react-aria/FocusScope.html

Implication:

- Modular key handling should default toward child ownership: parent scopes should not respond after a child handled a key.
- Focus restoration and focus movement are separate tools from shortcut dispatch.

### Radix Primitives

Radix treats ARIA roles, focus management, and keyboard navigation as component-level responsibilities guided by WAI-ARIA/APG.

Reference:

- https://www.radix-ui.com/primitives/docs/overview/accessibility

Implication:

- Component libraries already solve many local APG behaviors. `@interactive-os/interaction` should not duplicate component internals.
- The gap is cross-component composition in an app shell, especially owner priority between nested composites, popups, scroll regions, and global shortcuts.

### Floating UI

`FloatingFocusManager` exposes modal and non-modal focus management, initial focus, return focus, restore focus, focus guards, outside inerting, and special combobox behavior.

Reference:

- https://floating-ui.com/docs/floatingfocusmanager

Implication:

- Return focus and restore focus are distinct. Return focus goes to an invoker or previous target; restore focus handles lost/removed focused elements.
- Focus guards and outside inerting are useful but must be scoped to the active floating surface.
- Combobox/popover cases need special handling where DOM focus may stay on the reference while the popup's active item changes.

### Angular CDK

Angular CDK's a11y package includes focus monitoring, focus origin tracking, focus traps, interactivity checks, and key managers for list-like focus movement.

Reference:

- https://material.angular.io/cdk/a11y/overview
- https://material.angular.io/cdk/a11y/api

Implication:

- Mature app frameworks treat focus modality and focus origin as first-class data.
- `@interactive-os/interaction` should record why ownership changed: keyboard, pointer, programmatic, open, close, restore, or native focus.

### Ariakit

Ariakit's composite model exposes controls such as `composite`, `focusOnMove`, `moveOnKeyPress`, and virtual focus. It explicitly supports cases where one composite must stop managing focus so another composite can take over.

Reference:

- https://ariakit.com/reference/composite

Implication:

- Ownership handoff between nested composites is a real de facto requirement.
- `@interactive-os/interaction` needs a way to say "this owner is present, but another owner currently interprets movement keys."

### Shortcut Libraries

Shortcut libraries expose scoping and input filtering:

- Mousetrap ignores `input`, `select`, `textarea`, and `contenteditable` by default unless opted in.
- react-hotkeys-hook has scopes and explicit form/contenteditable opt-ins.
- hotkeys-js exposes filters and scopes for input vs other contexts.

References:

- https://craig.is/killing/mice
- https://www.npmjs.com/package/react-hotkeys-hook
- https://www.npmjs.com/package/hotkeys-js

Implication:

- App-level shortcuts already need scopes and input guards.
- Shortcut scopes are necessary but not sufficient: they do not know APG active cursor, focus projection, or restore targets.

### VS Code and CodeMirror

VS Code keybindings use context expressions (`when` clauses), rule precedence, conflict inspection, and troubleshooting logs. CodeMirror keymaps have precedence, scopes, and stop-propagation controls.

References:

- https://code.visualstudio.com/docs/configure/keybindings
- https://codemirror.net/docs/ref/#view.keymap

Implication:

- Complex app shells need inspectable key routing.
- `@interactive-os/interaction` should expose diagnostics: active owner, candidate owners, matching key rules, blocked native target, and restore path.

## Gap Analysis

Existing solutions cover important slices:

```txt
APG / ARIA
  -> widget behavior contracts

React Aria / Radix / Ariakit
  -> component-local focus and keyboard behavior

Floating UI / focus-trap utilities
  -> overlay focus lifecycle

Shortcut libraries / VS Code / CodeMirror
  -> key scopes, priority, and command routing
```

The missing layer is shell-level interaction ownership:

```txt
role-backed composite currently owns interaction
native focus moves to scroll container or incidental focus target
custom/global key is pressed
temporary input/editor/popup opens
owner must be chosen
active cursor and focus must be restored when ownership ends
```

## Requirements for `@interactive-os/interaction`

### R1. Framework-Neutral Core

The core package should be DOM-aware only through explicit adapter inputs. It should not require React and should not depend on `@interactive-os/aria` at runtime.

### R2. Declared Interaction Scopes

Owners must be registered inside explicit scopes. No default global key capture.

Owner kinds should include at least:

- `pattern`: APG composite or pattern surface
- `temporary-control`: input, inline editor, popup content, native control
- `shell`: app-level command surface

### R3. Priority-Based Key Routing

Key routing should evaluate:

1. active modal or trapped scope
2. temporary owner
3. active composite owner
4. shell/global owner
5. browser/native fallback

The first owner that handles the key should stop further routing unless it explicitly yields.

### R4. Focus Guard for Role-Backed Composites

When a declared composite owns interaction, incidental focus targets inside or around it must not silently become the arrow-key owner.

Examples:

- scroll container receives focus while tree active cursor is inside the tree
- wrapper with `tabindex="0"` steals focus from listbox root
- native focus moves to a decorative action surface inside a role-backed composite

The guard must be scoped and reversible. It must not suppress text inputs, form controls, contenteditable, dialogs, or intentional native controls without an explicit owner rule.

### R5. Temporary Ownership

Temporary owners must declare:

- how ownership is entered
- which keys they own
- which keys restore the previous owner
- whether they allow parent/global shortcuts
- where focus or active cursor returns

This is the generalized version of APG grid editing mode.

### R6. Restore Targets

Restore targets should be semantic, not raw DOM-only:

- `invoker`
- `previous-owner`
- `active-cursor`
- `edited-cell`
- `first-invalid-field`
- `next-logical-target`
- explicit element/ref

### R7. Native Control Respect

Native text entry must be protected by default:

- `input`
- `textarea`
- `select`
- `contenteditable`
- browser/system shortcuts that cannot or should not be intercepted

Opt-in is allowed for app-level commands such as save, command palette, or escape, but only with explicit owner policy.

### R8. Diagnostics

The package should make routing explainable:

- current owner
- active scope stack
- active cursor target
- DOM active element
- matched key rule
- reason a key was ignored
- restore target chosen
- focus guard intervention

This follows the VS Code/CodeMirror precedent: complex key routing needs tooling.

### R9. APG Pattern Integration

`@interactive-os/aria` should remain the APG behavior contract package. `@interactive-os/interaction` may consume pattern descriptors from it later, but `@interactive-os/aria` must not depend on the interaction package.

Integration should be descriptor-like:

```txt
pattern owner descriptor
├─ role
├─ activeKey
├─ focusStrategy
├─ navigation keys
├─ temporary owner entry keys
├─ restore target
└─ diagnostics labels
```

## Non-Goals

- Do not install a document-level key router by default.
- Do not replace APG pattern keyboard behavior.
- Do not replace browser focus semantics.
- Do not make every focus movement a trap.
- Do not hijack native form controls by default.
- Do not make `@interactive-os/aria` depend on `@interactive-os/interaction`.

## Implementation Direction

### Phase 1: Core Ownership Registry

Keep the current extraction-ready package and expand it around:

- owner registration
- active owner
- temporary owner stack
- restore callback
- key ownership predicate
- diagnostics snapshot

Current incubation slice:

- `createInteractionOwnershipRegistry` tracks active owner, registered owners, temporary return stack, and declared restore target.
- `createInteractionDiagnosticsSnapshot` combines registry state, owner stack, owner diagnostics, DOM focus metadata, key route result, matched key rule, ignored/native fallback reason, restore target, and focus guard intervention in one inspectable snapshot.

No DOM listener yet.

### Phase 2: Key Routing Engine

Add a pure routing function:

```ts
routeInteractionKey(registry, input): InteractionRouteResult
```

The result should explain whether an owner handled, yielded, restored, or ignored the key.

Current incubation slice:

- `routeInteractionKey` chooses between active owner, restore intent, shell owner, protected native target, and browser fallback.
- `InteractionRouteResult` reports active owner, candidate owners, target kind, route status, route reason, matched key rule when declared, restore owner, and declared restore target.
- It does not install a document listener or mutate focus by default.

### Phase 3: DOM Focus Guard Adapter

Add an optional DOM adapter that observes focus changes inside declared scopes and can detect when native focus has moved to an incidental target.

This adapter should report intended actions first; direct refocus should be opt-in.

Current incubation slice:

- `classifyInteractionKeyTarget` maps DOM targets to `text-input`, `textarea`, `select`, `contenteditable`, `native-control`, `pattern`, `scroll-container`, `incidental`, or `unknown`.
- `evaluateInteractionFocusGuard` reports whether a focus move should restore the active pattern owner, activate another declared owner, allow native focus, or do nothing.
- `evaluateInteractionFocusTarget` is a DOM-target adapter around the same pure guard decision and does not mutate focus.
- `routeInteractionKeyboardEvent` combines KeyboardEvent modifier state with target classification.
- `handleInteractionKeyboardEvent` can prevent default for handled owner/restore routes and can explicitly release a temporary owner on restore keys when opted in.

### Phase 4: React Shell Adapter

Add optional React provider/hooks only after the core protocol is stable.

The React layer can provide:

- provider for scope registration
- hook for APG pattern owner registration
- hook for temporary owners
- diagnostics panel for demos

Current incubation slice:

- `@interactive-os/interaction/react` exposes an optional `InteractionProvider` and keeps React out of the root/core entry.
- `useInteractionOwner` registers pattern, temporary-control, and shell owners against the provider registry.
- `useInteractionKeyboardHandler` routes React keyboard events through the core keyboard adapter.
- `useInteractionFocusGuardHandler` routes React focus events through the pure focus guard decision adapter.

### Phase 5: APG Demo Integration

Create minimal behavior demos:

- tree + scroll container focus theft
- listbox + toolbar commands
- grid cell edit mode
- menu/search input temporary owner
- dialog with nested composite restore

Keep demo explanation minimal; use source/state/diagnostics to show the behavior.

Current incubation slice:

- `TreeviewInteractionOwnershipDemo` renders the real APG treeview inside a shell-level interaction owner.
- Its tests prove tree keyboard intent survives scroll-container focus, native text input keeps its own keys, `Escape` restores ownership from a temporary input, and only allowed shell shortcuts route globally.
- `TreeviewInteractionProviderDemo` renders the same APG treeview scenario through `InteractionProvider` and React hooks.
- Its tests prove the React focus guard restores incidental scroll focus to the active tree item, keyboard routing still moves the tree cursor, temporary input `Escape` restores tree ownership and focus, and shell shortcuts remain opt-in.
- `ListboxToolbarInteractionOwnershipDemo` renders a real APG listbox next to a real APG toolbar command surface.
- Its tests prove toolbar focus can own toolbar roving and command keys, vertical movement can restore the listbox cursor, filter input arrows stay native, input `Escape` restores listbox ownership and option focus, and shell shortcuts stay opt-in from the toolbar owner.
- `GridInteractionOwnershipDemo` renders the real editable APG grid inside the same ownership model.
- Its tests prove grid navigation survives scroll-container focus, editor arrow keys stay native, edit-mode `Escape` restores grid ownership and cell focus, and shell shortcuts stay opt-in while editing.
- `MenuSearchInteractionOwnershipDemo` renders a real APG menu button with a search input as a temporary owner.
- Its tests prove menu opening and movement can be routed through the menu owner, search input arrows stay native, search `Escape` restores menu ownership and menuitem focus without closing the menu, and shell shortcuts stay opt-in from search.
- `DialogInteractionOwnershipDemo` renders a dialog with a nested APG listbox and search input.
- Its tests prove dialog chrome can delegate movement to the nested listbox, search input keeps native text navigation, `Escape` restores from search to listbox without closing the dialog, and allowed shell shortcuts remain opt-in.

## Decision

The package goal should be stated as:

> `@interactive-os/interaction` coordinates keyboard and focus ownership in application shells composed from APG patterns and native controls.

The package exists to preserve the user's current interaction context when browser-native focus, APG active cursor, app-level shortcuts, temporary editors, popups, scroll containers, and dialogs overlap.
