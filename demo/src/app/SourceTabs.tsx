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
  const tabEntries = tabs.map((tab) => ({ tab, key: tabKey(tab) }))
  const keyToTab = new Map(tabEntries.map(({ tab, key }) => [key, tab]))
  const data = createSourceTabsData(label, tabEntries, tabKey(value))

  const runtime = useTabsPattern({
    data,
    options: { orientation: 'horizontal', activationMode: 'automatic' },
    onEvent: (event) => {
      if (event.type === 'select') selectTab(event.keys[0], keyToTab, onChange)
      if (event.type === 'navigate') selectTab(resolveSelectedTab(reduceTabsData(data, event), event), keyToTab, onChange)
    },
  })

  return {
    tabs,
    getTablistProps: runtime.getTablistProps,
    getTabProps: (tab: T) => runtime.getTabProps(tabKey(tab)),
    getPanelProps: () => runtime.getTabPanelProps(panelKey(tabKey(value))),
  }
}

export function SourceTabs<T extends SourceTabKey>({ tabs, getTablistProps, getTabProps }: SourceTabsViewProps<T>) {
  return (
    <div {...getTablistProps()} className="flex min-w-0 gap-1 overflow-x-auto whitespace-nowrap rounded-xl bg-zinc-100/75 p-1 dark:bg-white/[0.045]">
      {tabs.map((tab) => (
        <button
          {...getTabProps(tab)}
          key={tab}
          type="button"
          className="h-8 shrink-0 rounded-lg px-2.5 text-xs font-medium text-zinc-500 outline-none transition hover:bg-white/70 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-white aria-selected:text-zinc-950 aria-selected:shadow-sm dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

function createSourceTabsData(label: string, tabs: readonly { tab: SourceTabKey; key: SourceTabKey }[], value: SourceTabKey): PatternData {
  return {
    items: Object.fromEntries(tabs.flatMap(({ tab, key }) => [[key, { label: tab }], [panelKey(key), { label: `${tab} source` }]])),
    relations: {
      rootKeys: tabs.map(({ key }) => key),
      controlsByKey: Object.fromEntries(tabs.map(({ key }) => [key, [panelKey(key)]])),
      ownerByKey: Object.fromEntries(tabs.map(({ key }) => [panelKey(key), key])),
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

function selectTab<T extends SourceTabKey>(key: string | null | undefined, keyToTab: ReadonlyMap<SourceTabKey, T>, onChange: (value: T) => void) {
  const tab = key ? keyToTab.get(key) : undefined
  if (tab) onChange(tab)
}

function panelKey(tab: string) {
  return `source-panel-${tab}`
}

function tabKey(tab: string) {
  const bytes = new TextEncoder().encode(tab)
  return `source-tab-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}
