import type { HTMLAttributes } from 'react'
import { createPatternRuntime, listboxDefinition, reducePatternData, type PatternData } from '../../../src'

type Props = HTMLAttributes<HTMLElement>

export function VariantListbox<T extends string>({
  value,
  items,
  label,
  idPrefix,
  onChange,
  orientation = 'vertical',
}: {
  value: T
  items: readonly { key: T; label: string }[]
  label: string
  idPrefix: string
  onChange: (value: T) => void
  orientation?: 'horizontal' | 'vertical'
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
    <div {...rootProps} className={`${orientation === 'horizontal' ? 'flex flex-wrap items-center gap-1' : 'grid gap-1'} outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500`}>
      {items.map((item) => (
        <button
          {...(runtime.getPartProps('option', item.key) as Props)}
          key={item.key}
          type="button"
          className="min-h-8 rounded-lg px-2.5 text-left text-xs font-medium text-zinc-600 outline-none transition hover:bg-white/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-white aria-selected:text-zinc-950 aria-selected:shadow-sm dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
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
