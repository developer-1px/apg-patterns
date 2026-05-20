# @interactive-os/apg-patterns

Zod-validated APG pattern runtime and React adapters.

Runtime dependencies are limited to `zod`. The root entry is React-free. React is an optional peer dependency for the React adapter and preset components.

The package models APG behavior as serializable `PatternDefinition` data, validates it with Zod, and projects it into runtime props, state, effects, and React-facing render items.

See [API.md](API.md) for the published entrypoints and export names.

## Install

```bash
npm install @interactive-os/apg-patterns
```

`zod` is installed as a runtime dependency.

For React hooks and preset components:

```bash
npm install @interactive-os/apg-patterns react
```

Use `@interactive-os/apg-patterns` or `@interactive-os/apg-patterns/core` for schema, runtime, and serializable pattern definitions without React.

Use `@interactive-os/apg-patterns/react` for React hooks and preset components.

## Quick Start

```tsx
import { buttonDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '@interactive-os/apg-patterns'

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
import { Button, type PatternData, type PatternEvent } from '@interactive-os/apg-patterns/react'

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
<Tree data={data} onEvent={onEvent} />
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

`useTreeviewPattern` and `useTabsPattern` also accept their legacy object inputs for compatibility:

```ts
useTreeviewPattern({ data, onEvent, options })
useTabsPattern({ data, onEvent, options })
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

## Demo

```bash
npm run demo
```

## Verification

```bash
npm run check
```

`check` runs repository hygiene validation, package independence validation, TypeScript validation, the Vitest suite, APG coverage validation, demo/source consistency checks, package manifest checks, the package build, API reference validation, export validation, publish-readiness validation, package consumer smoke tests including actual npm pack tarball integrity, published docs, npm tarball installation and Vite bundling, and the production demo smoke test:

```bash
npm run check:repo
npm run check:independence
npm run typecheck
npm test
npm run check:apg
npm run check:preset
npm run check:demo
npm run check:package
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

`check:readme` type-checks the Quick Start and React API TypeScript examples against the built package.

`check:repo` verifies that generated outputs, local environment files, IDE files, and ignored paths are not tracked by git.

`check:independence` verifies that this package keeps its dependency surface separate from legacy APG workspaces.

`check:api` validates that API.md matches the built root, `./core`, and `./react` declaration export surfaces.

After changing public exports, run `npm run update:api` after `npm run build` to refresh API.md.

`check:exports` validates package manifest paths and ESM/CJS conditional declaration export boundaries for the root, `./core`, and `./react` entries.

`check:publish` validates package metadata, package-lock root consistency, local-only dependency specs, packed tarball contents, npm publish dry-run metadata, the documented public publish command, runtime external imports, portable sourcemaps with source content, and production source imports that would create public-entry circular initialization.

Before publishing a new version, run `npm run check:registry` to confirm the current package version is still unpublished on the public npm registry.

For the full release preflight:

```bash
npm run release:check
```

Publish after the preflight passes:

```bash
npm publish --access public
```

## Design Notes

- [React facade zod blind loop](docs/proposals/2026-05-18-react-facade-zod-blind-loop.md)
- [LLM-friendly APG React API](docs/proposals/2026-05-18-llm-friendly-apg-react-api.md)
