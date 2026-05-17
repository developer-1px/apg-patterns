import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../../src'
import { gridVariantItems, type GridVariantKey } from './gridData'

export function GridVariantMenu({ value, onChange }: { value: GridVariantKey; onChange: (value: GridVariantKey) => void }) {
  const data = createGridVariantData(value)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], onChange)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange)
    },
    { focusStrategy: 'rovingTabIndex', selectionMode: 'single', elementIdPrefix: 'grid-variant-' },
  )

  return (
    <div {...listbox.rootProps} className="grid gap-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500">
      {listbox.renderItems.map((variant) => (
        <button
          {...variant.optionProps}
          key={variant.key}
          type="button"
          className="h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
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

function selectVariant(key: string | null | undefined, onChange: (value: GridVariantKey) => void) {
  if (gridVariantItems.some((variant) => variant.key === key)) onChange(key as GridVariantKey)
}
