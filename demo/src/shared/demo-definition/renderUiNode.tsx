import type { ReactNode } from 'react'
import { VariantListbox } from './VariantListbox'
import { UiNodeSchema, type UiNode, type UiRenderContext } from './uiSchema'

type ListboxItem = { key: string; label: string }

export function renderUiNode(node: UiNode, context: UiRenderContext): ReactNode {
  const parsed = UiNodeSchema.parse(node)
  if (parsed.kind === 'stack') {
    return (
      <div className={parsed.gap === 'sm' ? 'grid gap-2' : 'grid gap-3'}>
        {parsed.children.map((child, index) => (
          <div key={index}>{renderUiNode(child, context)}</div>
        ))}
      </div>
    )
  }
  if (parsed.kind === 'listbox') {
    return (
      <VariantListbox
        orientation={parsed.orientation}
        value={resolveString(context, parsed.value)}
        items={resolveListboxItems(context, parsed.items)}
        label={parsed.label}
        idPrefix={parsed.idPrefix}
        onChange={resolveAction(context, parsed.onChange)}
      />
    )
  }

  const Component = context.components[parsed.component]
  if (!Component) throw new Error(`[uiSchema] unknown component: ${parsed.component}`)
  const props = Object.fromEntries(
    Object.entries(parsed.props ?? {}).map(([name, binding]) => [name, resolveBinding(context, binding)]),
  )
  return <Component {...props} />
}

export function resolveBinding(context: UiRenderContext, binding: string): unknown {
  if (!binding.startsWith('$')) throw new Error(`[uiSchema] invalid binding: ${binding}`)
  const [root, ...segments] = binding.slice(1).split('.')
  const source = root === 'actions' ? context.actions : context.values[root]
  if (source === undefined) throw new Error(`[uiSchema] unknown binding root: ${binding}`)
  return segments.reduce<unknown>((current, segment) => {
    if (!isRecord(current) || !(segment in current)) throw new Error(`[uiSchema] unresolved binding: ${binding}`)
    return current[segment]
  }, source)
}

function resolveString(context: UiRenderContext, binding: string) {
  const value = resolveBinding(context, binding)
  if (typeof value !== 'string') throw new Error(`[uiSchema] binding is not a string: ${binding}`)
  return value
}

function resolveListboxItems(context: UiRenderContext, binding: string) {
  const value = resolveBinding(context, binding)
  if (!Array.isArray(value) || !value.every(isListboxItem)) throw new Error(`[uiSchema] binding is not listbox items: ${binding}`)
  return value
}

function resolveAction(context: UiRenderContext, binding: string) {
  const value = resolveBinding(context, binding)
  if (typeof value !== 'function') throw new Error(`[uiSchema] binding is not an action: ${binding}`)
  return value as (value: string) => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isListboxItem(value: unknown): value is ListboxItem {
  return isRecord(value) && typeof value.key === 'string' && typeof value.label === 'string'
}
