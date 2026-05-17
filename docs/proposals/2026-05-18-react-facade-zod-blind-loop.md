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

Pending.
