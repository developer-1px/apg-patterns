import type { HTMLAttributes } from 'react'
import { createPatternRuntime, listboxDefinition, reducePatternData, type PatternData } from '../../../src'

type Props = HTMLAttributes<HTMLElement>

export function VariantListbox<T extends string>({
  value,
  items,
  label,
  idPrefix,
  onChange,
}: {
  value: T
  items: readonly { key: T; label: string }[]
  label: string
  idPrefix: string
  onChange: (value: T) => void
}) {
  const data = createVariantData(value, items, label)
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single' },
    onEvent: (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], items, onChange)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, items, onChange)
    },
    keyToElementId: (key) => `${idPrefix}-${key}`,
  })
  const rootProps = runtime.getPartProps('listbox') as Props

  return (
    <div {...rootProps} className="grid gap-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500">
      {items.map((item) => (
        <button
          {...(runtime.getPartProps('option', item.key) as Props)}
          key={item.key}
          type="button"
          className="h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function createVariantData<T extends string>(
  value: T,
  items: readonly { key: T; label: string }[],
  label: string,
): PatternData {
  return {
    items: Object.fromEntries(items.map((item) => [item.key, { label: item.label }])),
    relations: { rootKeys: items.map((item) => item.key) },
    state: { activeKey: value, selectedKeys: [value] },
    refs: { label },
  }
}

function selectVariant<T extends string>(
  key: string | null | undefined,
  items: readonly { key: T; label: string }[],
  onChange: (value: T) => void,
) {
  if (items.some((item) => item.key === key)) onChange(key as T)
}
