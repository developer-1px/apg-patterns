import type { HTMLAttributes } from 'react'
import { reduceTabsData, useTabsPattern, type PatternData, type PatternEvent } from '../../../src'

type SourceTabKey = string

interface UseSourceTabsInput<T extends SourceTabKey> {
  label: string
  tabs: readonly T[]
  value: T
  onChange: (value: T) => void
}

interface SourceTabsViewProps<T extends SourceTabKey> {
  tabs: readonly T[]
  getTablistProps: () => HTMLAttributes<HTMLElement>
  getTabProps: (tab: T) => HTMLAttributes<HTMLElement>
}

export function useSourceTabs<T extends SourceTabKey>({ label, tabs, value, onChange }: UseSourceTabsInput<T>) {
  const data = createSourceTabsData(label, tabs, value)
  const tabSet = new Set<SourceTabKey>(tabs)

  const runtime = useTabsPattern({
    data,
    options: { orientation: 'horizontal', activationMode: 'automatic' },
    onEvent: (event) => {
      if (event.type === 'select') selectTab(event.keys[0], tabSet, onChange)
      if (event.type === 'navigate') selectTab(resolveSelectedTab(reduceTabsData(data, event), event), tabSet, onChange)
    },
  })

  return {
    tabs,
    getTablistProps: runtime.getTablistProps,
    getTabProps: runtime.getTabProps,
    getPanelProps: () => runtime.getTabPanelProps(panelKey(value)),
  }
}

export function SourceTabs<T extends SourceTabKey>({ tabs, getTablistProps, getTabProps }: SourceTabsViewProps<T>) {
  return (
    <div {...getTablistProps()} className="flex min-w-0 gap-1 overflow-x-auto whitespace-nowrap rounded-md bg-zinc-100 p-1 dark:bg-zinc-900">
      {tabs.map((tab) => (
        <button
          {...getTabProps(tab)}
          key={tab}
          type="button"
          className="h-8 shrink-0 rounded-md px-2.5 text-xs font-medium text-zinc-500 outline-none transition hover:bg-zinc-200/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-white aria-selected:text-zinc-950 aria-selected:shadow-sm dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-950 dark:aria-selected:text-zinc-50"
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function createSourceTabsData<T extends SourceTabKey>(label: string, tabs: readonly T[], value: T): PatternData {
  return {
    items: Object.fromEntries(tabs.flatMap((tab) => [[tab, { label: tab }], [panelKey(tab), { label: `${tab} source` }]])),
    relations: {
      rootKeys: [...tabs],
      controlsByKey: Object.fromEntries(tabs.map((tab) => [tab, [panelKey(tab)]])),
      ownerByKey: Object.fromEntries(tabs.map((tab) => [panelKey(tab), tab])),
    },
    state: {
      activeKey: value,
      selectedKeys: [value],
    },
    refs: {
      label,
    },
  }
}

function resolveSelectedTab(data: PatternData, event: PatternEvent) {
  if (event.type === 'navigate') return data.state?.activeKey
  return data.state?.selectedKeys?.[0]
}

function selectTab<T extends SourceTabKey>(key: string | null | undefined, tabs: Set<SourceTabKey>, onChange: (value: T) => void) {
  if (key && tabs.has(key)) onChange(key as T)
}

function panelKey(tab: string) {
  return `source-panel-${tab.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}
