---
type: proposal
status: draft
date: 2026-05-24
title: Interaction Ownership Incubation
---

# Interaction Ownership Incubation

## Judgment

`@interactive-os/aria` should remain the APG-backed keyboard behavior contract package. It should not become the global key router or global focus manager.

Interaction ownership can be incubated in this repository while it is discovered through APG demos, but it must stay outside the public `@interactive-os/aria` runtime surface until the boundary is stable.

Research baseline: [Interaction ownership technical research](2026-05-24-interaction-ownership-technical-research.md).

## Package Goal and Significance

Goal: coordinate keyboard and focus ownership in application shells composed from APG patterns, native controls, custom keys, and global keys.

This matters because app shells often combine trees, lists, menus, toolbars, dialogs, forms, scroll containers, and inline editors. In those shells, browser DOM focus alone is not enough to know who should interpret `ArrowDown`, `Escape`, `Enter`, or app-level shortcuts.

The package should make interaction ownership explicit so:

- a tree cursor keeps owning tree navigation even when an incidental scroll container receives focus
- a listbox, menu, grid, or toolbar can protect its APG keyboard contract from accidental native focus theft
- an input, editor, popover, or dialog can intentionally take temporary ownership and then restore the previous owner
- global shortcuts can run only when the active owner allows them
- focus restoration becomes a declared lifecycle, not a best-effort side effect

## Identity

The project starts from keyboard behavior, not from visual components. Many keyboard interactions already have shared social expectations: arrow keys move through trees, lists, menus, grids, and controls in recognizable ways.

APG is the reference language for those expectations. This package encodes them as reusable behavior contracts: key bindings, focus movement, active cursor state, semantic roles, state transitions, and emitted events.

## Terms

```txt
keyboard behavior contract
├─ keyboard binding: physical key to semantic event
├─ axis: pattern-local direction vocabulary
├─ active cursor: logical current position, usually activeKey
├─ focus strategy: DOM focus or aria-activedescendant projection
├─ focus lifecycle: enter, suspend, restore, escape
└─ interaction owner: pattern or control currently allowed to interpret keys
```

`axis` is not a global keymap and not a focus manager. It only describes how directional movement is interpreted inside one pattern contract.

Active cursor state is not enough. A keyboard contract must also define which owner currently interprets keys, and where focus returns when a temporary owner exits.

## Repository Boundary

Allowed during incubation:

- Proposal docs under `docs/proposals`.
- A private extraction-ready package under `packages/interaction`.
- Reproduction demos for tree, scrollbar, input, form, dialog, and inline editing ownership conflicts.
- Discovering metadata that APG patterns may later expose to an app-level interaction layer.

Not allowed during incubation:

- Public root/core exports for a global manager.
- Pattern runtimes depending on a global manager.
- React adapters installing global key listeners by default.
- Demo chrome or explanatory decoration beyond what is needed to inspect behavior.

## Dependency Direction

```txt
@interactive-os/interaction or app shell
  -> @interactive-os/aria

@interactive-os/aria
  -/-> global interaction manager
```

If a global manager becomes a product, it should live in an app shell or a separate interaction package. This repository may provide the APG contract vocabulary and demo fixtures that make that manager possible.

## Incubation Layout

```txt
packages/interaction/
├─ package.json: private @interactive-os/interaction package identity
├─ src/
│  ├─ interactionKeyTarget.ts: DOM key target classification
│  ├─ interactionKeyTarget.test.ts: native, APG, scroll, and incidental target tests
│  ├─ interactionFocusGuard.ts: pure focus guard decision adapter
│  ├─ interactionFocusGuard.test.ts: focus restore, native allow, and owner handoff tests
│  ├─ interactionKeyboardEvent.ts: explicit KeyboardEvent-to-route adapter
│  ├─ interactionKeyboardEvent.test.ts: event routing and optional restore release tests
│  ├─ interactionOwnership.ts: owner registry, restore target, and protocol primitives
│  ├─ interactionOwnership.test.ts: focused ownership, restore target, and restore tests
│  ├─ interactionRouting.ts: pure owner/native/shell route selection
│  ├─ interactionRouting.test.ts: key routing priority tests
│  ├─ react/
│  │  ├─ index.tsx: optional React provider and hooks subpath
│  │  └─ InteractionProvider.test.tsx: React registration, keyboard, and focus guard tests
│  └─ index.ts: React-free package root exports
├─ tsconfig.json
└─ vitest.config.ts
```

This layout is intentionally outside root `src/` so it cannot become part of the `@interactive-os/aria` npm package by accident. The package remains private until the boundary is stable.

Verify the incubation package directly:

```bash
npm run check:interaction
```

## Extraction Signal

Extract to a separate package only after at least two APG demos need the same ownership protocol and one non-APG shell scenario needs the same registry semantics.

Current signal:

- APG demos now cover tree, listbox + toolbar, grid edit mode, menu + search, and dialog + nested listbox ownership.
- Package-level routing tests cover a non-APG command-palette search owner using the same temporary-owner restore and shell-shortcut policy.
- Restore targets are semantic descriptors, so route diagnostics can name `active-cursor`, `edited-cell`, `invoker`, or another declared destination without depending on React refs.
- Focus guard decisions are reported before mutation: incidental and scroll focus can restore the active pattern owner, native controls are allowed, and declared owner targets can request explicit handoff.
- React shell hooks live behind the `./react` subpath and cover owner registration, keyboard routing, temporary restore, and focus guard decisions without moving React into the package root.
