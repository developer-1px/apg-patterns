import type { HTMLAttributes } from 'react'
import { useTabsPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export function Tabs({
  data,
  onEvent,
  onDataChange,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  onDataChange: (data: PatternData, event: PatternEvent) => void
  options?: PatternOptions
}) {
  const tabs = useTabsPattern({
    data,
    options: { orientation: 'horizontal', activationMode: 'automatic', ...options },
    onEvent,
    onDataChange,
  })
  const panelKey = tabs.selectedPanelKey

  return (
    <div className="grid max-w-lg gap-4">
      <div {...(tabs.getTablistProps() as Props)} className="flex gap-1 bg-white py-1 dark:bg-zinc-950">
        {tabs.tabs.map((key) => (
          <button
            key={key}
            type="button"
            {...(tabs.getTabProps(key) as Props)}
            className="h-8 rounded px-3 text-sm text-zinc-600 outline-none hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950 dark:focus:outline-zinc-500"
          >
            {data.items[key]?.label}
          </button>
        ))}
      </div>
      {panelKey ? (
        <div {...(tabs.getTabPanelProps(panelKey) as Props)} className="min-h-32 bg-zinc-50 p-3 text-sm text-zinc-700 outline-none dark:bg-zinc-900/70 dark:text-zinc-300">
          {data.items[panelKey]?.label}
        </div>
      ) : null}
    </div>
  )
}
