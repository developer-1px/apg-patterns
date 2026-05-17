import { useListboxPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { ListboxContent } from './ListboxContent'
import { ListboxOption } from './ListboxOption'
import type { ListboxGroup } from './listboxTypes'

export function Listbox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (data.state?.options as PatternOptions | undefined) ?? {}
  const groups = (data.state?.groups as readonly ListboxGroup[] | undefined) ?? []
  const scrollable = data.state?.scrollable === true
  const ariaLabelledBy = typeof data.refs?.labelledBy === 'string' ? data.refs.labelledBy : undefined
  const listbox = useListboxPattern(data, onEvent, options)
  const visibleKeys = data.relations?.rootKeys ?? []
  const selectionMode = options?.selectionMode ?? 'single'
  const isMulti = selectionMode === 'multiple'
  const renderItemsByKey = new Map(listbox.renderItems.map((item) => [item.key, item]))

  const renderOption = (key: string, posIndex?: number, setSize?: number) => {
    const item = renderItemsByKey.get(key)
    return (
      <ListboxOption
        key={key}
        itemKey={key}
        data={data}
        optionProps={item?.optionProps}
        isMulti={isMulti}
        posIndex={posIndex}
        setSize={setSize}
      />
    )
  }

  const containerClass = [
    'grid max-w-sm gap-0.5 bg-white py-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:focus:outline-zinc-500',
    scrollable ? 'max-h-48 overflow-y-auto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...listbox.rootProps} aria-labelledby={ariaLabelledBy} className={containerClass}>
      <ListboxContent data={data} groups={groups} visibleKeys={visibleKeys} renderOption={renderOption} />
    </div>
  )
}
