import { useEffect } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../../src'
import { readVariantRoute, useVariantRoutePattern, writeVariantRoute } from '../../shared/variantRoute'
import { gridVariantItems, type GridVariantKey } from './gridData'

export function GridVariantMenu({ value, onChange }: { value: GridVariantKey; onChange: (value: GridVariantKey) => void }) {
  const routePattern = useVariantRoutePattern()

  useEffect(() => {
    const variant = readVariantRoute(routePattern)
    if (!isGridVariantKey(variant) || variant === value) return
    onChange(variant)
  }, [onChange, routePattern, value])

  const data = createGridVariantData(value)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], onChange, routePattern)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange, routePattern)
    },
    { focusStrategy: 'rovingTabIndex', selectionMode: 'single', elementIdPrefix: 'grid-variant-' },
  )

  return (
    <div {...listbox.rootProps} className="grid gap-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500">
      {listbox.renderItems.map((variant) => (
        <button
          {...variant.optionProps}
          key={variant.key}
          type="button"
          className="h-8 rounded-lg px-2.5 text-left text-xs font-medium text-zinc-600 outline-none transition hover:bg-white/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-zinc-900 aria-selected:text-white aria-selected:shadow-sm dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
        >
          {variant.label}
        </button>
      ))}
    </div>
  )
}

function createGridVariantData(value: GridVariantKey): PatternData {
  return {
    items: Object.fromEntries(gridVariantItems.map((variant) => [variant.key, { label: variant.label }])),
    relations: {
      rootKeys: gridVariantItems.map((variant) => variant.key),
    },
    state: {
      activeKey: value,
      selectedKeys: [value],
    },
    refs: { label: 'grid variants' },
  }
}

function selectVariant(key: string | null | undefined, onChange: (value: GridVariantKey) => void, routePattern: string | null) {
  if (!isGridVariantKey(key)) return
  writeVariantRoute(routePattern, key)
  onChange(key)
}

function isGridVariantKey(key: string | null | undefined): key is GridVariantKey {
  return typeof key === 'string' && gridVariantItems.some((variant) => variant.key === key)
}
