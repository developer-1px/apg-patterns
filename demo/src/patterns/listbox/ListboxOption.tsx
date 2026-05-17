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
      className="min-h-8 rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none transition aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-white/75 data-active:text-zinc-950 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-white/[0.07] dark:aria-selected:text-zinc-50 dark:data-active:bg-white/[0.055] dark:data-active:text-zinc-50 dark:data-[focus-visible]:outline-zinc-500 dark:focus-visible:outline-zinc-500"
    >
      {item.label}
    </div>
  )
}
