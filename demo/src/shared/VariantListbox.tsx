import { useEffect } from 'react'
import type { HTMLAttributes } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../src'
import { useVariantRoutePattern } from './variantRoute'

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
    const variant = currentHashVariant(routePattern)
    if (!variant || variant === value) return
    const item = items.find((candidate) => candidate.key === variant)
    if (item) onChange(item.key)
  }, [items, onChange, routePattern, value])

  const data = createVariantData(value, items, label)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectVariant(event.keys[0], items, onChange)
      if (event.type === 'navigate') selectVariant(reducePatternData(listboxDefinition, data, event).state?.activeKey, items, onChange)
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
      className={`${orientation === 'horizontal' ? 'flex flex-wrap items-center gap-1' : 'grid gap-1'} outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500`}
    >
      {listbox.renderItems.map((item) => (
        <button
          {...(item.optionProps as Props)}
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
  const item = items.find((candidate) => candidate.key === key)
  if (!item) return
  writeHashVariant(item.key)
  onChange(item.key)
}

function currentHashVariant(routePattern: string | null) {
  if (typeof window === 'undefined') return null
  if (!routePattern) return null
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  if (params.get('pattern') !== routePattern) return null
  return params.get('variant')
}

function writeHashVariant(variant: string) {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  params.set('variant', variant)
  const nextHash = `#${params.toString()}`
  if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash)
}
