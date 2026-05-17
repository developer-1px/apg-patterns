import type { HTMLAttributes } from 'react'
import { createPatternRuntime, listboxDefinition, reducePatternData, type PatternData } from '../../src'
import { treeVariantItems, type TreeVariantKey } from './treeVariants'

type Props = HTMLAttributes<HTMLElement>

export function TreeVariantMenu({ value, onChange }: { value: TreeVariantKey; onChange: (value: TreeVariantKey) => void }) {
  const data = createTreeVariantData(value)
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single' },
    onEvent: (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], onChange)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange)
    },
    keyToElementId: (key) => `tree-variant-${key}`,
  })
  const rootProps = runtime.getPartProps('listbox') as Props

  return (
    <div {...rootProps} className="grid gap-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500">
      {treeVariantItems.map((variant) => (
        <button
          {...(runtime.getPartProps('option', variant.key) as Props)}
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
