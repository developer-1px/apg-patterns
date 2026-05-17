import type { PatternRuntime } from '../../../../src'
import type { ListboxProps, OptionClickHandler } from './listboxTypes'

export function ListboxOption({
  itemKey,
  data,
  runtime,
  isMulti,
  onOptionClick,
  posIndex,
  setSize,
}: {
  itemKey: string
  data: PatternRuntime['data']
  runtime: PatternRuntime
  isMulti: boolean
  onOptionClick: OptionClickHandler
  posIndex?: number
  setSize?: number
}) {
  const optionProps = runtime.getPartProps('option', itemKey) as ListboxProps
  const state = runtime.getItemState(itemKey, 'option')
  const onClick = isMulti
    ? (event: Parameters<OptionClickHandler>[0]) => onOptionClick(event, itemKey)
    : optionProps.onClick

  return (
    <div
      key={itemKey}
      {...optionProps}
      onClick={onClick}
      aria-posinset={posIndex}
      aria-setsize={setSize}
      data-active={state.active ? '' : undefined}
      className="min-h-8 rounded px-2 py-1.5 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
    >
      {data.items[itemKey]?.label}
    </div>
  )
}
