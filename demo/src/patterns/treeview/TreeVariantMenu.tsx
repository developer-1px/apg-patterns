import { useEffect } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../../src'
import { readVariantRoute, useVariantRoutePattern, writeVariantRoute } from '../../shared/variantRoute'
import { treeVariantItems, type TreeVariantKey } from './treeVariants'

export function TreeVariantMenu({ value, onChange }: { value: TreeVariantKey; onChange: (value: TreeVariantKey) => void }) {
  const routePattern = useVariantRoutePattern()

  useEffect(() => {
    const variant = readVariantRoute(routePattern)
    if (!isTreeVariantKey(variant) || variant === value) return
    onChange(variant)
  }, [onChange, routePattern, value])

  const data = createTreeVariantData(value)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], onChange, routePattern)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange, routePattern)
    },
    { focusStrategy: 'rovingTabIndex', selectionMode: 'single', elementIdPrefix: 'tree-variant-' },
  )

  return (
    <div {...listbox.rootProps} className="grid gap-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500">
      {listbox.renderItems.map((variant) => (
        <button
          {...variant.optionProps}
          key={variant.key}
          type="button"
          className="min-h-8 rounded-lg px-2.5 text-left text-xs font-medium text-zinc-600 outline-none transition hover:bg-white/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-zinc-900 aria-selected:text-white aria-selected:shadow-sm dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
        >
          {variant.label}
        </button>
      ))}
    </div>
  )
}

function createTreeVariantData(value: TreeVariantKey): PatternData {
  return {
    items: Object.fromEntries(treeVariantItems.map((variant) => [variant.key, { label: variant.label }])),
    relations: { rootKeys: treeVariantItems.map((variant) => variant.key) },
    state: { activeKey: value, selectedKeys: [value] },
    refs: { label: 'tree variants' },
  }
}

function selectVariant(key: string | null | undefined, onChange: (value: TreeVariantKey) => void, routePattern: string | null) {
  if (!isTreeVariantKey(key)) return
  writeVariantRoute(routePattern, key)
  onChange(key)
}

function isTreeVariantKey(key: string | null | undefined): key is TreeVariantKey {
  return typeof key === 'string' && treeVariantItems.some((variant) => variant.key === key)
}
