# @interactive-os/apg-treeview-contract

Zod-validated APG pattern runtime and React adapters.

The package models APG behavior as serializable `PatternDefinition` data, validates it with Zod, and projects it into runtime props, state, effects, and React-facing render items.

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

## Current React API

The active React-facing convention is:

```ts
useXPattern(data, onEvent, options?)
```

Implemented pattern hooks:

```ts
useTreeviewPattern(data, onEvent, options?)
useListboxPattern(data, onEvent, options?)
useTabsPattern(input)
```

`useTreeviewPattern` still also accepts its legacy object input for compatibility:

```ts
useTreeviewPattern({ data, onEvent, options })
```

Treeview and listbox return the LLM-oriented facade shape:

```ts
const listbox = useListboxPattern(data, onEvent, options)

listbox.rootProps
listbox.renderItems
listbox.state
listbox.actions
listbox.ids
```

`renderItems` is the JSX mapping surface. App code should spread the named semantic props onto the named element and own all visual styling.

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

The descriptor is currently attached to listbox and treeview definitions.

## Demo

```bash
pnpm demo
```

or:

```bash
npm run demo
```

## Verification

```bash
npm run typecheck
npm test
```

## Design Notes

- [React facade zod blind loop](docs/proposals/2026-05-18-react-facade-zod-blind-loop.md)
- [LLM-friendly APG React API](docs/proposals/2026-05-18-llm-friendly-apg-react-api.md)
