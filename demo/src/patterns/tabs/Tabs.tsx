import type { HTMLAttributes } from 'react'
import { useTabsPattern, type PatternData, type PatternEvent, type PatternItem, type PatternOptions } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'

type Props = HTMLAttributes<HTMLElement>

interface TabsDemoItem extends PatternItem {
  content?: string
}

type TabsDemoOptions = PatternOptions & {
  activationMode?: 'automatic' | 'manual'
  closeable?: boolean
  scrollable?: boolean
}

type TabsDemoData = PatternData<TabsDemoItem>

export function Tabs({
  data,
  onEvent,
  options,
}: {
  data: TabsDemoData
  onEvent: (event: PatternEvent) => void
  options?: TabsDemoOptions
}) {
  const mergedOptions = { orientation: 'horizontal' as const, activationMode: 'automatic' as const, ...(options ?? {}) }
  const tabs = useTabsPattern(data, onEvent, mergedOptions)
  const panelKey = tabs.selectedPanelKey
  const orientation = mergedOptions.orientation
  const scrollable = (mergedOptions as { scrollable?: boolean }).scrollable === true
  const closeable = (mergedOptions as { closeable?: boolean }).closeable === true
  const isVertical = orientation === 'vertical'
  const containerClass = isVertical
    ? 'grid max-w-2xl gap-3 sm:grid-cols-[minmax(120px,auto)_minmax(0,1fr)] sm:gap-4'
    : 'grid max-w-2xl gap-4'
  const tablistClass = isVertical
    ? 'flex gap-1 overflow-x-auto rounded-md border border-zinc-200 p-1 dark:border-white/10 sm:flex-col sm:overflow-visible'
    : 'flex gap-1 overflow-x-auto rounded-md border border-zinc-200 p-1 dark:border-white/10'
  const tabClass = isVertical
    ? cx(ds.option, 'h-8 shrink-0 px-3 text-sm sm:w-full')
    : cx(ds.option, 'h-8 shrink-0 px-3 text-sm')
  const panelClass = scrollable
    ? cx('max-h-48 overflow-auto rounded-md border border-zinc-200 p-3 text-sm leading-relaxed text-zinc-700 dark:border-white/10 dark:text-zinc-300', ds.focusRing)
    : 'min-h-32 rounded-md border border-zinc-200 p-3 text-sm leading-relaxed text-zinc-700 outline-none dark:border-white/10 dark:text-zinc-300'

  return (
    <div className={containerClass}>
      <div {...(tabs.getTablistProps() as Props)} className={tablistClass}>
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
                  onClick={(event) => {
                    event.stopPropagation()
                    onEvent({ type: 'close', key })
                  }}
                  className={cx(ds.iconButton, 'ml-1 size-5 bg-transparent shadow-none')}
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
          <div className={data.items[panelKey]?.content ? 'mb-1 font-semibold' : 'font-semibold'}>{data.items[panelKey]?.label}</div>
          {data.items[panelKey]?.content ? <div>{data.items[panelKey]?.content}</div> : null}
        </div>
      ) : null}
    </div>
  )
}
