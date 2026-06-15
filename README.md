# @interactive-os/aria

Zod-validated APG pattern runtime and React adapters.

Runtime dependencies are limited to `zod`. The root entry is React-free. React is an optional peer dependency for the React adapter and preset components.

The package models APG behavior as serializable `PatternDefinition` data, validates it with Zod, and projects it into runtime props, state, effects, and React-facing render items.

See [API.md](API.md) for the published entrypoints and export names.
See [INTERFACE_STABILITY.md](INTERFACE_STABILITY.md) for the interface contracts
this package treats as permanent.

## Install

```bash
npm install @interactive-os/aria
```

`zod` is installed as a runtime dependency.

For React hooks and preset components, install React 18 or 19:

```bash
npm install @interactive-os/aria react
```

Use `@interactive-os/aria` or `@interactive-os/aria/core` for schema, runtime, and serializable pattern definitions without React.

Use `@interactive-os/aria/react` for React hooks and preset components.

## Compatibility

- Runtime: Node.js `>=18.18`.
- Runtime dependency: `zod`.
- React `^18.0.0 || ^19.0.0` is an optional peer dependency for `@interactive-os/aria/react`.
- The root entry and `@interactive-os/aria/core` are React-free.
- ESM, CommonJS, and TypeScript declarations are published for every public entry.
- Release verification uses `npm@11.6.2` from `packageManager`.

## Quick Start

```tsx
import { buttonDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '@interactive-os/aria'

const data: PatternData = {
  items: { primary: { label: 'Save' } },
  relations: { rootKeys: ['primary'] },
  state: { activeKey: 'primary' },
}

const events: PatternEvent[] = []
const runtime = createPatternRuntime({
  definition: buttonDefinition,
  data,
  onEvent: (event) => events.push(event),
})

runtime.getPartProps('button', 'primary')
```

React:

```tsx
import { Button, type PatternData, type PatternEvent } from '@interactive-os/aria/react'

function Example(props: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  return <Button data={props.data} onEvent={props.onEvent} />
}
```

```txt
PatternDefinition
├─ parts: role / aria / focus / state / events
├─ navigation: visible order + keyboard targets
├─ keyboard: serialized shortcut bindings
├─ effects: focus / restore / trap descriptors
└─ react: hook/root/renderItems facade descriptor
```

```txt
PatternData
├─ items
│  └─ stable item payloads
├─ relations
│  └─ rootKeys / childrenByKey / ownerByKey / grid relations
├─ state
│  └─ activeKey / selectedKeys / expandedKeys / derived APG metadata
└─ refs
   └─ labels and external references
```

## React API

The React-facing convention is:

```ts
useXPattern(data, onEvent, options?)
```

Descriptor-backed preset components are available for patterns that can fully own their DOM structure:

```tsx
<Accordion data={data} onEvent={onEvent} />
<Alert data={data} onEvent={onEvent} />
<AlertDialog data={data} onEvent={onEvent} />
<Breadcrumb data={data} onEvent={onEvent} />
<Button data={data} onEvent={onEvent} />
<Carousel data={data} onEvent={onEvent} />
<Checkbox data={data} onEvent={onEvent} />
<Combobox data={data} onEvent={onEvent} />
<Dialog data={data} onEvent={onEvent} />
<Disclosure data={data} onEvent={onEvent} />
<Feed data={data} onEvent={onEvent} />
<Grid data={data} onEvent={onEvent} />
<Landmarks data={data} />
<Link data={data} onEvent={onEvent} />
<Listbox data={data} onEvent={onEvent} />
<MenuButton data={data} onEvent={onEvent} />
<Menubar data={data} onEvent={onEvent} />
<Meter data={data} />
<RadioGroup data={data} onEvent={onEvent} />
<Slider data={data} onEvent={onEvent} />
<Spinbutton data={data} onEvent={onEvent} />
<Switch data={data} onEvent={onEvent} />
<Table data={data} />
<Tabs data={data} onEvent={onEvent} />
<Toolbar data={data} onEvent={onEvent} />
<Tooltip data={data} onEvent={onEvent} />
<Treeview data={data} onEvent={onEvent} />
<Treegrid data={data} onEvent={onEvent} />
<WindowSplitter data={data} onEvent={onEvent} />
```

Implemented hooks:

```ts
useAccordionPattern(data, onEvent, options?)
useAlertPattern(data, onEvent, options?)
useAlertDialogPattern(data, onEvent, options?)
useBreadcrumbPattern(data, onEvent, options?)
useButtonPattern(data, onEvent, options?)
useCarouselPattern(data, onEvent, options?)
useCheckboxPattern(data, onEvent, options?)
useComboboxPattern(data, onEvent, options?)
useDialogPattern(data, onEvent, options?)
useDisclosurePattern(data, onEvent, options?)
useFeedPattern(data, onEvent, options?)
useGridPattern(data, onEvent, options?)
useLandmarksPattern(data, onEvent, options?)
useLinkPattern(data, onEvent, options?)
useListboxPattern(data, onEvent, options?)
useMenuButtonPattern(data, onEvent, options?)
useMenubarPattern(data, onEvent, options?)
useMeterPattern(data, onEvent, options?)
useRadioGroupPattern(data, onEvent, options?)
useSliderPattern(data, onEvent, options?)
useSpinbuttonPattern(data, onEvent, options?)
useSwitchPattern(data, onEvent, options?)
useTablePattern(data, onEvent, options?)
useTabsPattern(data, onEvent, options?)
useToolbarPattern(data, onEvent, options?)
useTooltipPattern(data, onEvent, options?)
useTreeviewPattern(data, onEvent, options?)
useTreegridPattern(data, onEvent, options?)
useWindowSplitterPattern(data, onEvent, options?)
```

Pattern hooks return semantic props, state, actions, and stable id helpers. Collection patterns also expose an LLM-oriented render surface:

```ts
const listbox = useListboxPattern(data, onEvent, options)

listbox.rootProps
listbox.renderItems
listbox.state
listbox.actions
listbox.ids
```

`renderItems` is the JSX mapping surface where present. App code should spread the named semantic props onto the named element and own all visual styling.

Triggerless popup menus use `useMenuPattern`. Use `relations.rootKeys[0]` as the menu key and `childrenByKey[menuKey]` as items; React options own `open`, `onClose`, `initialActiveKey`, and `restoreFocusTo`.

```tsx
const listbox = useListboxPattern(data, onEvent, options)

return (
  <div {...listbox.rootProps}>
    {listbox.renderItems.map((item) => (
      <div key={item.key} {...item.optionProps}>
        {item.label}
      </div>
    ))}
  </div>
)
```

```tsx
const tree = useTreeviewPattern(data, onEvent, options)

return (
  <div {...tree.rootProps}>
    {tree.renderItems.map((item) => (
      <div
        key={item.key}
        {...item.treeitemProps}
        style={{ paddingInlineStart: `${(item.level - 1) * 18}px` }}
      >
        {item.kind === 'branch' && (
          <button {...item.toggleButtonProps}>
            {item.state.expanded ? '−' : '+'}
          </button>
        )}
        {item.label}
      </div>
    ))}
  </div>
)
```

Rules:

- `rootProps` and item `*Props` are semantic/behavior props only.
- Generated props do not include `className` or visual `style`.
- App code may add `className`, `style`, and `data-*` after spreading.
- App code should not replace `role`, `tabIndex`, `aria-*`, `ref`, or event handlers except through a documented composition helper.
- Treeview `toggleButtonProps` owns expansion only and stops propagation.

Grid range selection is opt-in. `useGridPattern(data, onEvent, { selectionMode: 'multiple' })`, or grid data with `state.multiselectable`, enables `Shift+Arrow*`, `Shift+Home`, `Shift+End`, `Control+a`, `Control+Space`, and `Shift+Space`. The hook exposes `state.activeKey`, `state.selectedKeys`, `state.anchorKey`, and `state.extentKey`; grid cells expose `cell.state.selected` and `aria-selected` through `cell.cellProps`.

Command surface helpers are available from the React entrypoint for flat, app-defined command arrays:

```ts
const toolbarData = createToolbarPatternData([
  { key: 'find', label: 'Find' },
  { key: 'replace', label: 'Replace' },
], { label: 'Search actions' })
const toolbar = usePatternStateReducer(toolbarDefinition, toolbarData)
const toolbarProps = { data: toolbar.data, onEvent: toolbar.onEvent }
```

Pass `{ state, onStateChange }` to `usePatternStateReducer` when the app owns the reducer state. Use `createToolbarPatternData`, `createRadioGroupPatternData`, or `createMenuButtonPatternData` when command keys, labels, disabled state, and initial selection are enough. Build `PatternData` directly when the surface owns nested relations, app-specific state records, composite grid/tree geometry, async loading state, or custom item metadata that should stay explicit.

WindowSplitter value helpers are available from the root/core/react entrypoints:

```ts
const nextData = reduceWindowSplitterValue(data, event, {
  min: 40,
  max: 400,
  step: 8,
  largeStep: 32,
})
```

`min` defaults to `0`, `max` to `100`, and `step` to `1`. `largeStep` defaults to one tenth of a finite range, never smaller than `step`; when helper options use `max: Infinity`, the upper clamp is disabled, `largeStep` defaults to `step * 10`, and a `max` value-step leaves the current value unchanged. `collapse` stores the current value in `state.previousValueByKey`, moves to `min`, then restores the previous value on the next collapse.

`useAutocompleteListbox` connects an app-owned text editor to APG listbox option semantics without moving DOM focus out of the editor:

```ts
const autocomplete = useAutocompleteListbox(data, onEvent, {
  open,
  ownerKey: 'formula-owner',
  popupId: 'formula-listbox',
})

const ownerProps = autocomplete.ownerProps
const popupProps = autocomplete.popupProps
const options = autocomplete.renderItems
```

`ownerProps` includes `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete`, and the owner keydown dispatcher. ArrowUp/ArrowDown emit open/navigation events, Enter and Tab select the active option and close, and Escape emits dismiss and close. `popupProps` and `renderItems[*].optionProps` come from the existing listbox runtime.

`useMenubarPattern` also returns `submenuProps(ownerKey)` for open submenu containers:

```ts
const submenuProps = menubar.submenuProps('file')
const submenuItems = menubar.itemsFor('file')
```

`submenuProps` provides `role="menu"`, `aria-labelledby`, and submenu keydown behavior. ArrowUp/ArrowDown/Home/End move between enabled submenu items, Escape closes the submenu and restores focus to the owner root item, and ArrowLeft/ArrowRight hand off to sibling root menus.

## React Facade Descriptor

`PatternDefinitionSchema` has an optional `react` section. It describes how to derive React hook output from a serializable definition:

```ts
react: {
  hook: 'useListboxPattern',
  root: { prop: 'rootProps', part: 'listbox', element: 'div' },
  renderItems: {
    name: 'renderItems',
    source: { kind: 'visibleOrder' },
    order: 'flat',
    variants: [
      {
        kind: 'option',
        when: { kind: 'always' },
        fields: {
          key: { kind: 'key' },
          kind: { kind: 'literal', value: 'option' },
          label: { kind: 'itemField', field: 'label', fallback: 'key' },
          textValue: { kind: 'textValue', fallback: 'label' },
          state: { kind: 'partState', part: 'option' },
        },
        props: {
          optionProps: { part: 'option', element: 'div', owner: 'item' },
        },
      },
    ],
  },
}
```

The descriptor is attached where a pattern has a generated React facade surface.

## Code Structure

```txt
src/
├─ index.ts: React-free root public entry
├─ core.ts: React-free schema, runtime, and pattern-definition entry
├─ react.ts: React adapter and preset-component entry
├─ schema/: serializable contracts and Zod validators
├─ kernel/: runtime resolution, reducers, events, and state helpers
├─ patterns/: APG definitions, runtime helpers, hooks, and presets
└─ adapters/: React prop, effect, focus, and id helpers

demo/src/
├─ app/: demo shell, routing, source viewer, and repro recorder
├─ patterns/: APG previews, demo data, and APG behavior tests
└─ shared/: demo registry, state hosts, variant controls, and inspectors

scripts/
└─ verify-*.mjs and smoke-*.mjs: API, package, publish, consumer, and demo gates
```

## Demo

https://developer-1px.github.io/apg-patterns/

```bash
npm run demo
```

## Verification

```bash
npm run check
```

`check` runs repository hygiene validation, public source credential-material scanning, package independence validation, TypeScript validation, the Vitest suite, APG coverage validation, demo/source consistency checks, package manifest checks, React peer compatibility validation, the package build, API reference validation, export validation, publish-readiness validation, package consumer smoke tests including actual npm pack tarball integrity, runtime export parity, published docs, install-lifecycle-free package metadata, npm tarball installation and Vite bundling, and the production demo smoke test:

```bash
npm run check:repo
npm run check:source-safety
npm run check:independence
npm run typecheck
npm test
npm run check:apg
npm run check:preset
npm run check:demo
npm run check:package
npm run check:react-peer
npm run build
npm run check:api
npm run check:exports
npm run check:readme
npm run check:publish
npm run smoke:package
npm run demo:smoke
```

To compare the demo's APG example coverage against the currently linked examples on w3.org:

```bash
npm run check:apg
```

`check:readme` type-checks the Quick Start and React API TypeScript examples against the built package and executes the root Quick Start.

`check:repo` verifies that generated outputs, local environment files, IDE files, ignored paths, and release artifacts are not tracked by git, that tracked bug records are release-resolved, that the Pages workflow deploys the demo, and that the GitHub Actions release workflows run the release preflight, upload the packed package artifact, and keep publishing on trusted OIDC auth instead of static npm tokens.

`check:source-safety` scans tracked source files for credential material before the repository is made public.

`check:independence` verifies that this package keeps its dependency surface separate from legacy APG workspaces.

For the interaction ownership package:

```bash
npm run check:interaction
```

`check:interaction` is intentionally separate from `npm run check` and verifies `packages/interaction` as its own package without adding it to the published `@interactive-os/aria` runtime surface.

`check:react-peer` verifies that the optional React peer supports React 18 and React 19 while production source imports stay within the checked React 18/19 API surface.

`check:api` validates that API.md matches the built root, `./core`, and `./react` declaration export surfaces.

After changing public exports, run `npm run update:api` after `npm run build` to refresh API.md.

`check:exports` validates package manifest paths, ESM/CJS conditional declaration and runtime export boundaries, and TypeScript declaration resolution for the root, `./core`, and `./react` entries.

`check:publish` validates package metadata, public GitHub repository metadata, GitHub Pages homepage metadata, origin alignment, package-lock root and runtime dependency consistency, local-only dependency specs, packed tarball contents, credential-material scans, packed Markdown links and deferred-placeholder scans, npm provenance publish dry-run metadata, the documented public provenance publish command and registry, runtime external imports, portable sourcemaps with source content, and production source imports that would create public-entry circular initialization.

`check:signatures` verifies installed dependency registry signatures and available attestations with `npm audit signatures`.

Before publishing a new version, run `npm run check:registry` to confirm the current package version is still unpublished on the public npm registry and, when the package already exists, is newer than the current `latest` dist-tag.

`check:release-ref` reports the expected release tag. In the publish workflow it is strict and requires `GITHUB_REF_TYPE=tag` with `GITHUB_REF_NAME=v<package.version>`.

`check:external` verifies the final external publishing state: local `origin` must match `package.json` `repository`, the GitHub repository visibility must be public, the public GitHub repository must be reachable, and the npm registry must still accept the current package version.

The publish workflow runs `npm run check:external` after the release preflight and before packing or publishing.

The release-check and publish workflows run `npm run check:release-artifacts`, then upload `release-artifacts/`, including the `npm pack` tarball and `npm-pack.json`, before publishing.

For the full release preflight:

```bash
npm run release:check
```

`release:check` adds the dependency signature audit, npm registry preflight, and release git-ref preflight to `npm run check`:

```bash
npm run check:signatures
npm run check:registry
npm run check:release-ref
```

After the public GitHub repository and npm trusted publisher are configured:

```bash
npm run check:external
```

`prepublishOnly` also runs `npm run release:check`, so direct `npm publish` still executes the full local, dependency signature, registry, and release-ref preflight.

Publish from the manual `Publish Package` GitHub Actions workflow on the `v<package.version>` git tag after configuring the package as an npm trusted publisher, or publish from a trusted GitHub Actions run after the preflight passes:

```bash
npm publish --access public --provenance --registry https://registry.npmjs.org/
```

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

## Release

See [RELEASE.md](RELEASE.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Report suspected vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).

## Design Notes

- [Interaction ownership incubation](docs/proposals/2026-05-24-interaction-ownership-incubation.md)
- [Interaction ownership technical research](docs/proposals/2026-05-24-interaction-ownership-technical-research.md)
- [React facade zod blind loop](docs/proposals/2026-05-18-react-facade-zod-blind-loop.md)
- [LLM-friendly APG React API](docs/proposals/2026-05-18-llm-friendly-apg-react-api.md)
