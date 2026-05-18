import type { ReactListboxRenderItem } from '../../../../src'
import { ds } from '../../shared/designSystem'

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
      className={ds.listOption}
    >
      {item.label}
    </div>
  )
}
