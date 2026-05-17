---
type: proposal
status: draft
date: 2026-05-18
title: React Facade Zod Descriptor Blind Loop
---

# React Facade Zod Descriptor Blind Loop

## Goal

Define a serializable zod descriptor that lets each APG pattern generate this React-facing shape:

```ts
const pattern = useXPattern(data, onEvent, options)

pattern.rootProps
pattern.renderItems
pattern.state
pattern.actions
pattern.ids
```

`renderItems` is the only collection intended for JSX mapping. Each render item exposes APG-part-named semantic props, such as `optionProps`, `treeitemProps`, and `indicatorProps`.

## Non-Goals

- Do not validate React functions or refs in zod.
- Do not infer TypeScript hook return types from arbitrary runtime JSON.
- Do not put `className` or visual `style` into generated semantic props.
- Do not make `usePattern(definition, ...)` the primary LLM-facing API.

## Zod Shape

```ts
import { z } from 'zod'

const ReactHookNameSchema = z.string().regex(/^use[A-Z][A-Za-z0-9]*Pattern$/)
const ReactPropNameSchema = z.string().regex(/^[a-z][A-Za-z0-9]*Props$/)

const ReactElementNameSchema = z.enum([
  'a',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'input',
  'li',
  'ol',
  'span',
  'ul',
])

const ReactSemanticDefaultPropSchema = z.enum([
  'aria-label',
  'aria-hidden',
  'type',
  'href',
  'target',
  'rel',
])

const ReactSemanticDefaultsSchema = z.record(
  ReactSemanticDefaultPropSchema,
  z.union([z.string(), z.number(), z.boolean()]),
)

const ReactRenderSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('visibleOrder') }).strict(),
])

const ReactRenderValueSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('key') }).strict(),
  z.object({
    kind: z.literal('itemField'),
    field: z.string().min(1),
    fallback: z.enum(['key']).optional(),
  }).strict(),
  z.object({
    kind: z.literal('stateRecord'),
    field: z.string().min(1),
    fallback: z.union([z.string(), z.number(), z.boolean()]).optional(),
  }).strict(),
  z.object({ kind: z.literal('partState'), part: z.string().min(1) }).strict(),
  z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict(),
  z.object({ kind: z.literal('isExpanded'), key: z.literal('$key') }).strict(),
  z.object({
    kind: z.literal('indentStyle'),
    levelField: z.string().min(1),
    unit: z.number().positive(),
    base: z.number().nonnegative().optional(),
  }).strict(),
])

const ReactItemPropSchema = z.object({
  part: z.string().min(1),
  element: ReactElementNameSchema.optional(),
  when: z.object({
    kind: z.enum(['hasChildren']),
    key: z.literal('$key'),
  }).strict().optional(),
  defaults: ReactSemanticDefaultsSchema.optional(),
}).strict()

const ReactRenderItemSchema = z.object({
  fields: z.record(z.string().min(1), ReactRenderValueSchema),
  props: z.record(ReactPropNameSchema, ReactItemPropSchema),
}).strict()

const ReactRootSchema = z.object({
  prop: z.literal('rootProps'),
  part: z.string().min(1),
  element: ReactElementNameSchema.optional(),
}).strict()

export const ReactFacadeSchema = z.object({
  hook: ReactHookNameSchema,
  root: ReactRootSchema,
  renderItems: z.object({
    name: z.literal('renderItems'),
    source: ReactRenderSourceSchema,
    item: ReactRenderItemSchema,
  }).strict().optional(),
}).strict()
```

## Descriptor Examples

### Listbox

```ts
react: {
  hook: 'useListboxPattern',
  root: { prop: 'rootProps', part: 'listbox', element: 'div' },
  renderItems: {
    name: 'renderItems',
    source: { kind: 'visibleOrder' },
    item: {
      fields: {
        key: { kind: 'key' },
        label: { kind: 'itemField', field: 'label', fallback: 'key' },
        state: { kind: 'partState', part: 'option' },
      },
      props: {
        optionProps: { part: 'option', element: 'div' },
      },
    },
  },
}
```

### Treeview

```ts
react: {
  hook: 'useTreeviewPattern',
  root: { prop: 'rootProps', part: 'tree', element: 'div' },
  renderItems: {
    name: 'renderItems',
    source: { kind: 'visibleOrder' },
    item: {
      fields: {
        key: { kind: 'key' },
        label: { kind: 'itemField', field: 'label', fallback: 'key' },
        level: { kind: 'stateRecord', field: 'levelByKey', fallback: 1 },
        indentStyle: { kind: 'indentStyle', levelField: 'level', unit: 18 },
        hasChildren: { kind: 'hasChildren', key: '$key' },
        expanded: { kind: 'isExpanded', key: '$key' },
        state: { kind: 'partState', part: 'treeitem' },
      },
      props: {
        treeitemProps: { part: 'treeitem', element: 'div' },
        indicatorProps: {
          part: 'indicator',
          element: 'button',
          when: { kind: 'hasChildren', key: '$key' },
          defaults: { type: 'button' },
        },
      },
    },
  },
}
```

## Cross-Validation Rules

- `root.part` must exist in `definition.parts`.
- Every `item.props.*.part` must exist in `definition.parts`.
- Every `partState.part` must exist in `definition.parts`.
- `root.prop` must be `rootProps`.
- `renderItems.name` must be `renderItems`.
- Generated semantic props must not contain `className` or visual `style`.
- `defaults` may only contain semantic safe props from `ReactSemanticDefaultPropSchema`.
- If `element: 'button'`, `defaults.type` should be present unless the runtime injects it.

## Blind Loop Notes

## Converged Descriptor

The blind loop converged on this interface shape:

```ts
const listbox = useListboxPattern(data, onEvent, options)
const tree = useTreeviewPattern(data, onEvent, options)
```

```ts
listbox.rootProps
listbox.renderItems

tree.rootProps
tree.renderItems
```

`renderItems` stays as the public field name. The name is slightly awkward, but it gave the strongest "map this for JSX" signal in earlier rounds. `items` was repeatedly interpreted as source data, and `visibleItems` is accurate for treeview but less consistent for non-expansion patterns.

### Public Render Shape

```ts
type ItemKey = string

type ItemState = {
  active: boolean
  selected: boolean
  disabled: boolean
}

type RenderBase = {
  key: ItemKey
  kind: string
  label: React.ReactNode
  textValue: string
  state: ItemState
}

type ListboxRenderItem = RenderBase & {
  kind: 'option'
  optionProps: React.HTMLAttributes<HTMLDivElement>
}

type TreeBase = RenderBase & {
  level: number // 1-based; root treeitems are level 1
  parentKey: ItemKey | null
  indexInParent: number // 1-based among rendered siblings under the same parent
  treeitemProps: React.HTMLAttributes<HTMLDivElement>
}

type TreeLeafRenderItem = TreeBase & {
  kind: 'leaf'
}

type TreeBranchRenderItem = TreeBase & {
  kind: 'branch'
  state: ItemState & {
    expanded: boolean
    toggleDisabled: boolean
  }
  toggleButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    type: 'button'
    tabIndex: -1
    'aria-label': string
  }
}

type TreeviewRenderItem = TreeLeafRenderItem | TreeBranchRenderItem
```

### Final Zod Additions

The descriptor must not encode React types directly. It declares how to derive the public render shape from `PatternDefinition` + `PatternData`.

```ts
const ReactHookNameSchema = z.string().regex(/^use[A-Z][A-Za-z0-9]*Pattern$/)
const ReactPropNameSchema = z.string().regex(/^[a-z][A-Za-z0-9]*Props$/)
const ReactItemFieldNameSchema = z.enum([
  'key',
  'kind',
  'label',
  'textValue',
  'level',
  'parentKey',
  'indexInParent',
  'state',
])

const ReactElementNameSchema = z.enum([
  'a',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'input',
  'li',
  'ol',
  'span',
  'ul',
])

const ReactSemanticDefaultPropSchema = z.enum([
  'aria-label',
  'aria-hidden',
  'disabled',
  'tabIndex',
  'href',
  'rel',
  'target',
  'type',
])

const ReactSemanticDefaultsSchema = z.record(
  ReactSemanticDefaultPropSchema,
  z.union([z.string(), z.number(), z.boolean()]),
)

const ReactRenderSourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('visibleOrder') }).strict(),
])

const ReactRenderValueSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('literal'), value: z.union([z.string(), z.number(), z.boolean(), z.null()]) }).strict(),
  z.object({ kind: z.literal('key') }).strict(),
  z.object({ kind: z.literal('itemField'), field: z.string().min(1), fallback: z.enum(['key']).optional() }).strict(),
  z.object({ kind: z.literal('textValue'), fallback: z.enum(['label', 'key']) }).strict(),
  z.object({ kind: z.literal('partState'), part: z.string().min(1) }).strict(),
  z.object({ kind: z.literal('treeKind'), branch: z.literal('branch'), leaf: z.literal('leaf') }).strict(),
  z.object({ kind: z.literal('treeLevel'), base: z.literal(1) }).strict(),
  z.object({ kind: z.literal('treeParentKey'), rootValue: z.literal(null) }).strict(),
  z.object({ kind: z.literal('treeIndexInParent'), base: z.literal(1) }).strict(),
])

const ReactPropOwnerSchema = z.enum([
  'root',
  'item',
  'toggle',
])

const ReactItemPropSchema = z.object({
  part: z.string().min(1),
  element: ReactElementNameSchema,
  owner: ReactPropOwnerSchema,
  whenKind: z.string().min(1).optional(),
  defaults: ReactSemanticDefaultsSchema.optional(),
  stopsPropagation: z.boolean().optional(),
}).strict()

const ReactRenderVariantSchema = z.object({
  kind: z.string().min(1),
  when: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('always') }).strict(),
    z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict(),
    z.object({ kind: z.literal('not'), predicate: z.object({ kind: z.literal('hasChildren'), key: z.literal('$key') }).strict() }).strict(),
  ]),
  fields: z.record(ReactItemFieldNameSchema, ReactRenderValueSchema),
  props: z.record(ReactPropNameSchema, ReactItemPropSchema),
}).strict()

const ReactRenderItemsSchema = z.object({
  name: z.literal('renderItems'),
  source: ReactRenderSourceSchema,
  order: z.enum(['flat', 'treePreorderVisible']).optional(),
  variants: z.array(ReactRenderVariantSchema).min(1).readonly(),
}).strict()

export const ReactFacadeSchema = z.object({
  hook: ReactHookNameSchema,
  root: z.object({
    prop: z.literal('rootProps'),
    part: z.string().min(1),
    element: ReactElementNameSchema,
  }).strict(),
  renderItems: ReactRenderItemsSchema.optional(),
}).strict()
```

### Final Descriptor Examples

#### Listbox

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

#### Treeview

```ts
react: {
  hook: 'useTreeviewPattern',
  root: { prop: 'rootProps', part: 'tree', element: 'div' },
  renderItems: {
    name: 'renderItems',
    source: { kind: 'visibleOrder' },
    order: 'treePreorderVisible',
    variants: [
      {
        kind: 'leaf',
        when: { kind: 'not', predicate: { kind: 'hasChildren', key: '$key' } },
        fields: {
          key: { kind: 'key' },
          kind: { kind: 'literal', value: 'leaf' },
          label: { kind: 'itemField', field: 'label', fallback: 'key' },
          textValue: { kind: 'textValue', fallback: 'label' },
          level: { kind: 'treeLevel', base: 1 },
          parentKey: { kind: 'treeParentKey', rootValue: null },
          indexInParent: { kind: 'treeIndexInParent', base: 1 },
          state: { kind: 'partState', part: 'treeitem' },
        },
        props: {
          treeitemProps: { part: 'treeitem', element: 'div', owner: 'item' },
        },
      },
      {
        kind: 'branch',
        when: { kind: 'hasChildren', key: '$key' },
        fields: {
          key: { kind: 'key' },
          kind: { kind: 'literal', value: 'branch' },
          label: { kind: 'itemField', field: 'label', fallback: 'key' },
          textValue: { kind: 'textValue', fallback: 'label' },
          level: { kind: 'treeLevel', base: 1 },
          parentKey: { kind: 'treeParentKey', rootValue: null },
          indexInParent: { kind: 'treeIndexInParent', base: 1 },
          state: { kind: 'partState', part: 'treeitem' },
        },
        props: {
          treeitemProps: { part: 'treeitem', element: 'div', owner: 'item' },
          toggleButtonProps: {
            part: 'indicator',
            element: 'button',
            owner: 'toggle',
            defaults: { type: 'button', tabIndex: -1 },
            stopsPropagation: true,
          },
        },
      },
    ],
  },
}
```

## Blind Loop Results

### Round 1

Initial schema exposed `indentStyle`, `hasChildren`, `expanded`, `treeitemProps`, and `indicatorProps`.

Failures:

- Agents attached `indentStyle` inconsistently to row, label, or wrapper.
- `indicatorProps` sounded decorative and was not clearly branch-only.
- `state` and `label` were underspecified.

Changes:

- Introduce discriminated tree item variants.
- Move from `indicatorProps` toward behavior-named toggle props.
- Require explicit `label` and state shape.

### Round 2

Tried `rowLayoutProps` plus branch/leaf variants.

Failures:

- `rowLayoutProps` contradicted "props are semantic-only".
- Agents nested an extra wrapper and were unsure whether `treeitemProps` or layout props owned the row.
- `expanded` existed both top-level and in state.

Changes:

- Remove layout props from hook output.
- Keep app-owned layout via `level`.
- Keep expansion only in branch `state.expanded`.

### Round 3

Used `level`, branch-only `indicatorButtonProps`, and semantic-only props.

Failures:

- `level` base was unclear.
- `indicatorButtonProps` still sounded visual.
- Missing `textValue` for typeahead/search.

Changes:

- Make `level` 1-based.
- Rename to `toggleButtonProps`.
- Add required `textValue`.

### Round 4

Added `textValue`, `toggleButtonProps`, and `level` base.

Failures:

- Root host element needed explicit docs.
- Tree metadata `index` was ambiguous.
- Agents asked for parent metadata without raw data access.

Changes:

- Root descriptor names host element.
- Add `parentKey`.
- Rename `index` to `indexInParent` and define it as 1-based.

### Round 5

Final candidate produced correct JSX across agents.

Remaining non-blocking questions:

- Whether `renderItems` should eventually be renamed. Keep for now because it strongly signals JSX mapping.
- Whether to expose `visibleIndex` for virtualization. Do not add until a real demo needs it.
- Whether to provide a handler composition helper. Keep as a separate React adapter utility, not in the descriptor.

Final rules:

- Use `useXPattern(data, onEvent, options?)`.
- `rootProps` goes on the root host named by the descriptor.
- `renderItems` is the only collection for JSX mapping.
- `*Props` fields are semantic/behavior only; no `className`, no `style`.
- App may add `className`, `style`, and `data-*` after spreading generated props.
- App must not replace `role`, `tabIndex`, `aria-*`, `ref`, or event handlers unless using a documented composition helper.
- Treeview uses `treeitemProps` for row focus/selection/treeitem ARIA and `toggleButtonProps` for expansion only.
