import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { useTabsPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { Icon } from './Icon'

type Props = HTMLAttributes<HTMLElement>

export function Tabs({
  data,
  onEvent,
  onDataChange,
  options,
  variantLabel,
  hint,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  onDataChange: (data: PatternData, event: PatternEvent) => void
  options?: PatternOptions
  variantLabel?: string
  hint?: string
}) {
  const mergedOptions = { orientation: 'horizontal' as const, activationMode: 'automatic' as const, ...options }
  const tabs = useTabsPattern({
    data,
    options: mergedOptions,
    onEvent,
    onDataChange,
  })
  const panelKey = tabs.selectedPanelKey
  const orientation = mergedOptions.orientation
  const scrollable = (mergedOptions as { scrollable?: boolean }).scrollable === true
  const closeable = (mergedOptions as { closeable?: boolean }).closeable === true
  const tablistRef = useRef<HTMLDivElement>(null)
  const didMountRef = useRef(false)

  const activeKey = data.state?.activeKey
  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (!activeKey) return
    const prefix = (mergedOptions as { elementIdPrefix?: string }).elementIdPrefix ?? 'tab-'
    const id = `${prefix}${activeKey.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`
    document.getElementById(id)?.focus({ preventScroll: true })
  }, [activeKey, mergedOptions])

  const isVertical = orientation === 'vertical'
  const containerClass = isVertical
    ? 'grid max-w-2xl gap-4 grid-cols-[140px_minmax(0,1fr)]'
    : 'grid max-w-2xl gap-4'
  const tablistClass = isVertical
    ? 'flex flex-col gap-1 border-r border-zinc-200 pr-2 dark:border-zinc-800'
    : 'flex gap-1 bg-white py-1 dark:bg-zinc-950'
  const tabClass = isVertical
    ? 'h-8 rounded px-3 text-left text-sm text-zinc-600 outline-none hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950 dark:focus:outline-zinc-500'
    : 'h-8 rounded px-3 text-sm text-zinc-600 outline-none hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950 dark:focus:outline-zinc-500'
  const panelClass = scrollable
    ? 'max-h-48 overflow-auto bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900/70 dark:text-zinc-300 dark:focus:outline-zinc-500'
    : 'min-h-32 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-700 outline-none dark:bg-zinc-900/70 dark:text-zinc-300'

  return (
    <div className="grid gap-3">
      {variantLabel ? (
        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">{variantLabel}</div>
      ) : null}
      {hint ? <p className="text-xs text-zinc-500 dark:text-zinc-500">{hint}</p> : null}
      <div className={containerClass}>
        <div {...(tabs.getTablistProps() as Props)} ref={tablistRef} className={tablistClass}>
          {tabs.tabs.map((key) => {
            const tabProps = tabs.getTabProps(key) as Props
            return (
              <span key={key} className={isVertical ? 'flex items-center' : 'inline-flex items-center'}>
                <button type="button" {...tabProps} className={tabClass}>
                  {data.items[key]?.label}
                </button>
                {closeable ? (
                  <button
                    type="button"
                    aria-label={`Close ${data.items[key]?.label ?? key}`}
                    tabIndex={-1}
                    onClick={(event) => {
                      event.stopPropagation()
                      onEvent({ type: 'extension', name: 'closeTab', key })
                    }}
                    className="ml-1 grid size-5 place-items-center rounded text-xs text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    <Icon name="x" />
                  </button>
                ) : null}
              </span>
            )
          })}
        </div>
        {panelKey ? (
          <div {...(tabs.getTabPanelProps(panelKey) as Props)} className={panelClass}>
            <div className="font-semibold mb-1">{data.items[panelKey]?.label}</div>
            <div>{(data.items[panelKey] as { content?: string })?.content}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
