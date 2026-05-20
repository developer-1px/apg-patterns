---
type: proposal
status: accepted
date: 2026-05-18
title: LLM-Friendly APG React API
---

# LLM-Friendly APG React API

## Implementation Progress

The preset renderer layer exists for descriptor-backed patterns:

```tsx
<Accordion data={data} onEvent={onEvent} />
<Breadcrumb data={data} onEvent={onEvent} />
<Button data={data} onEvent={onEvent} />
<Checkbox data={data} onEvent={onEvent} />
<Link data={data} onEvent={onEvent} />
<Listbox data={data} onEvent={onEvent} />
<Meter data={data} />
<RadioGroup data={data} onEvent={onEvent} />
<Switch data={data} onEvent={onEvent} />
<Toolbar data={data} onEvent={onEvent} />
<Tree data={data} onEvent={onEvent} />
```

The remaining scope is to extend this layer beyond these established preset components.

## Problem

LLMs often fail when an API asks them to assemble APG semantics manually.

Both common approaches have failure points:

- Prop-spread headless APIs require the LLM to attach the right props to the right DOM node.
- Radix-style compound/slot APIs require the LLM to understand component relationships, `asChild`, trigger/content pairing, portals, controlled state, and nested slots.

The likely cause is not that LLMs cannot use React. It is that they have not strongly learned this project-specific APG API. New abstractions force inference, and inference creates mistakes.

## Judgment

The most LLM-friendly API should look like React patterns the model already knows, while hiding APG structure inside the library.

The primary API should not be headless. It should be a preset renderer:

```tsx
<Tree data={data} onEvent={onEvent} />
<Listbox data={data} onEvent={onEvent} />
<Dialog open={open} onEvent={onEvent} />
```

APG semantics, DOM structure, ARIA attributes, keyboard behavior, focus management, and event propagation should be owned by the pattern component.

The LLM should mostly provide:

- data
- options
- simple view configuration
- small content renderers only when needed

## API Tiers

### 1. LLM Primary: Preset Renderer

```tsx
<Tree data={data} onEvent={onEvent} options={options} />
```

This is the safest API for LLM-generated demos and simple apps.

The component owns:

- root element
- item mapping
- APG roles and attributes
- keyboard behavior
- focus behavior
- toggle/select behavior
- event propagation

### 2. Controlled Content: Small Render Hooks

```tsx
<Tree
  data={data}
  onEvent={onEvent}
  options={options}
  renderLabel={(item) => item.label}
/>
```

The LLM can customize content without owning APG structure.

Allowed render hooks should be narrow:

- `renderLabel`
- `renderIcon`
- `renderValue`
- `renderDescription`

Avoid render hooks that expose full structural control unless they are explicitly advanced.

### 3. Declarative View Config

```tsx
<Tree
  data={data}
  onEvent={onEvent}
  view={{
    label: 'label',
    icon: 'kind',
    href: 'href',
    indent: true,
  }}
/>
```

This may be easier than JSX for some LLM tasks because the model only fills an object.

Risk: `view` becomes a new DSL. Keep it small and field-oriented.

### 4. Template Presets

```tsx
<Tree
  data={data}
  variant="files"
  density="compact"
  selection="single"
/>
```

Preset variants are especially useful for demos:

- `files`
- `navigation`
- `settings`
- `command`
- `single-select`
- `multi-select`

The LLM chooses a known preset rather than building UI structure.

### 5. Advanced: Headless Hook

```tsx
const tree = useTreeviewPattern(data, onEvent, options)
```

This remains necessary for design-system implementation and custom rendering.

It should not be the primary LLM-facing API.

## Naming Direction

Prefer names that look like normal React components:

```tsx
<Tree />
<Listbox />
<Dialog />
```

Names like `<TreeviewPattern />` are precise but less natural. They expose implementation language instead of user intent.

The corresponding headless hooks can keep explicit APG names:

```ts
useTreeviewPattern(data, onEvent, options)
useListboxPattern(data, onEvent, options)
```

## Principle

> Do not ask the LLM to assemble semantic DOM.
> Let the pattern renderer own APG structure and interaction.
> Let the LLM provide data, options, and small content choices.

## Recommended Stack

```txt
LLM primary
  <Tree data={data} onEvent={onEvent} />
  <Listbox data={data} onEvent={onEvent} />

LLM customization
  view={{ label: 'label', icon: 'kind' }}
  renderLabel={(item) => item.label}

Design-system advanced
  useTreeviewPattern(data, onEvent, options)
  useListboxPattern(data, onEvent, options)

Core
  zod PatternDefinition
  react facade descriptor
  runtime/effects/input handling
```

## Why This Beats Radix for LLMs

Radix-style APIs are excellent for human design-system authors, but LLMs often struggle with:

- compound component nesting
- implicit provider scope
- `Root` / `Trigger` / `Content` relationships
- `asChild`
- portal placement
- controlled vs uncontrolled state
- which element receives which slot props

Preset renderers remove those decisions from the generated code.

## Why This Beats Pure Props

Headless props APIs are flexible, but the LLM must know:

- which collection to map
- which prop bag goes on which element
- where toggle buttons live
- whether the tree is flat or nested
- where visual indentation belongs
- how to avoid overriding ARIA/event handlers

Preset renderers make those choices once inside the library.

## Working Rule

For every APG pattern, provide three layers:

```txt
1. Preset component: <Tree data onEvent options />
2. Narrow customization: view / renderLabel / variant
3. Headless hook: useTreeviewPattern(data, onEvent, options)
```

LLM-facing docs should lead with layer 1.
