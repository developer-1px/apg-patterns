import { useEffect } from 'react'
import type { HTMLAttributes } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../src'
import { cx, ds } from './designSystem'
import { readVariantRoute, useVariantRoutePattern, writeVariantRoute } from './variantRoute'

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
  const routePattern = useVariantRoutePattern()

  useEffect(() => {
    const variant = readVariantRoute(routePattern)
    if (!variant || variant === value) return
    const item = items.find((candidate) => candidate.key === variant)
    if (item) onChange(item.key)
  }, [items, onChange, routePattern, value])

  const data = createVariantData(value, items, label)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], items, onChange, routePattern)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, items, onChange, routePattern)
    },
    { focusStrategy: 'rovingTabIndex', selectionMode: 'single', elementIdPrefix: `${idPrefix}-` },
  )
  const rootProps = listbox.rootProps as Props
  const handleKeyDown = rootProps.onKeyDown

  return (
    <div
      {...rootProps}
      onKeyDown={(event) => {
        if (orientation === 'horizontal' && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
          handleKeyDown?.({
            ...event,
            key: event.key === 'ArrowRight' ? 'ArrowDown' : 'ArrowUp',
            code: event.code === 'ArrowRight' ? 'ArrowDown' : 'ArrowUp',
          })
          return
        }
        handleKeyDown?.(event)
      }}
      className={cx(orientation === 'horizontal' ? 'flex flex-wrap items-center gap-1' : 'grid gap-1', ds.focusRing)}
    >
      {listbox.renderItems.map((item) => (
        <button
          {...(item.optionProps as Props)}
          key={item.key}
          type="button"
          className={ds.option}
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
  routePattern: string | null,
) {
  const item = items.find((candidate) => candidate.key === key)
  if (!item) return
  writeVariantRoute(routePattern, item.key)
  onChange(item.key)
}
