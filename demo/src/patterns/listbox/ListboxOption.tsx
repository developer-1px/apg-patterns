import type { ReactListboxRenderItem } from '../../../../src'

export function ListboxOption({
  item,
  isMulti,
  posIndex,
  setSize,
}: {
  item: ReactListboxRenderItem
  isMulti: boolean
  posIndex?: number
  setSize?: number
}) {
  return (
    <div
      key={item.key}
      {...item.optionProps}
      aria-posinset={posIndex}
      aria-setsize={setSize}
      data-active={item.state.active ? '' : undefined}
      data-multiselectable={isMulti ? '' : undefined}
      className="min-h-8 rounded px-2 py-1.5 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
    >
      {item.label}
    </div>
  )
}
