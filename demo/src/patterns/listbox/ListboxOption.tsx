import type { PatternData } from '../../../../src'
import type { ListboxProps } from './listboxTypes'

export function ListboxOption({
  itemKey,
  data,
  optionProps,
  isMulti,
  posIndex,
  setSize,
}: {
  itemKey: string
  data: PatternData
  optionProps?: ListboxProps
  isMulti: boolean
  posIndex?: number
  setSize?: number
}) {
  return (
    <div
      key={itemKey}
      {...optionProps}
      aria-posinset={posIndex}
      aria-setsize={setSize}
      data-active={data.state?.activeKey === itemKey ? '' : undefined}
      data-multiselectable={isMulti ? '' : undefined}
      className="min-h-8 rounded px-2 py-1.5 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
    >
      {data.items[itemKey]?.label}
    </div>
  )
}
