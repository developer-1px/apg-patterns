import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../../src'
import { treeVariantItems, type TreeVariantKey } from './treeVariants'

export function TreeVariantMenu({ value, onChange }: { value: TreeVariantKey; onChange: (value: TreeVariantKey) => void }) {
  const data = createTreeVariantData(value)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], onChange)
      if (event.type === 'navigate') {
        const nextKey = reducePatternData(listboxDefinition, data, event).state?.activeKey
        focusVariant(nextKey)
        selectVariant(nextKey, onChange)
      }
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

function selectVariant(key: string | null | undefined, onChange: (value: TreeVariantKey) => void) {
  if (treeVariantItems.some((variant) => variant.key === key)) onChange(key as TreeVariantKey)
}

function focusVariant(key: string | null | undefined) {
  if (!key) return
  document.getElementById(`tree-variant-${key}`)?.focus({ preventScroll: true })
}
