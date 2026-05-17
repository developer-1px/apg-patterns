import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { checkboxDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '../../../../src'
import { Icon } from '../../shared/Icon'

type Props = HTMLAttributes<HTMLElement>

const itemClass =
  'inline-flex h-8 max-w-sm items-center gap-2 rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500'

export function Checkbox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createPatternRuntime({
    definition: checkboxDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (key) => `checkbox-${key}`,
  })

  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const items = rootKeys.map((key) => {
    const { onKeyDown: _ignore, ...props } = runtime.getPartProps('checkbox', key) as Props
    const state = runtime.getItemState(key, 'checkbox')
    return { key, props, state }
  })

  const onItemKeyDown = (key: string) => (event: KeyboardEvent<HTMLDivElement>) => {
    const result = runtime.resolveKeyboardBinding(event as unknown as KeyInput, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault()
    for (const next of result.events) runtime.emit(next)
  }

  const onItemFocus = (key: string) => () => runtime.emit({ type: 'focus', key })

  const renderItem = ({ key, props, state }: (typeof items)[number]) => {
    const checked = state.checked
    return (
      <div
        key={key}
        {...props}
        tabIndex={0}
        onKeyDown={onItemKeyDown(key)}
        onFocus={onItemFocus(key)}
        className={itemClass}
      >
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded border border-zinc-400 text-xs text-zinc-900 dark:border-zinc-600 dark:text-zinc-100"
        >
          {checked === 'mixed' ? <Icon name="minus" /> : null}
          {checked === true ? <Icon name="x" /> : null}
        </span>
        <span>{data.items[key]?.label}</span>
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
