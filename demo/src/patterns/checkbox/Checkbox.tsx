import { useCheckboxPattern, type PatternData, type PatternEvent } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'

const itemClass = cx(ds.option, ds.checkable, 'inline-flex h-8 max-w-sm items-center gap-2 text-sm')

export function Checkbox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const checkbox = useCheckboxPattern(data, onEvent)
  const items = checkbox.renderItems
  if (items.length === 0) return null

  const renderItem = ({ key, label, checkboxProps, state }: (typeof items)[number]) => {
    const checked = state.checked
    return (
      <div
        key={key}
        {...checkboxProps}
        className={itemClass}
      >
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded bg-white text-xs text-zinc-900 shadow-[inset_0_1px_2px_rgba(24,24,27,0.08),0_2px_8px_rgba(24,24,27,0.08)] dark:bg-white/[0.07] dark:text-zinc-100 dark:shadow-black/20"
        >
          {checked === 'mixed' ? <Icon name="minus" /> : null}
          {checked === true ? <Icon name="x" /> : null}
        </span>
        <span>{label}</span>
      </div>
    )
  }

  if (items.length === 1) return renderItem(items[0]!)

  const parent = items[0]!
  const children = items.slice(1)
  const groupId = `checkbox-group-${parent.key}-label`
  const groupLabel = data.refs?.label
  return (
    <div className="grid gap-1">
      {groupLabel ? (
        <div id={groupId} className="px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {groupLabel}
        </div>
      ) : null}
      {renderItem(parent)}
      <div role="group" aria-labelledby={groupLabel ? groupId : undefined} className="ml-4 grid gap-0.5">
        {children.map(renderItem)}
      </div>
    </div>
  )
}
