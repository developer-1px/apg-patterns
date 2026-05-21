import type { HTMLAttributes } from 'react'
import { reduceTabsData, useTabsPattern, type PatternData, type PatternEvent } from '../../../src/react'
import { cx, ds } from '../shared/designSystem'

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

  const runtime = useTabsPattern(
    data,
    (event) => {
      if (event.type === 'select') selectTab(event.keys[0], keyToTab, onChange)
      if (event.type === 'navigate') selectTab(resolveSelectedTab(reduceTabsData(data, event), event), keyToTab, onChange)
    },
    { orientation: 'horizontal', activationMode: 'automatic' },
  )

  return {
    tabs,
    getTablistProps: runtime.getTablistProps,
    getTabProps: (tab: T) => runtime.getTabProps(tabKey(tab)),
    getPanelProps: () => runtime.getTabPanelProps(panelKey(tabKey(value))),
  }
}

export function SourceTabs<T extends SourceTabKey>({ tabs, getTablistProps, getTabProps }: SourceTabsViewProps<T>) {
  return (
    <div {...getTablistProps()} className={cx('flex min-w-0 gap-1 overflow-x-auto whitespace-nowrap', ds.controlGroup)}>
      {tabs.map((tab) => (
        <button
          {...getTabProps(tab)}
          key={tab}
          type="button"
          className={cx('h-8 shrink-0', ds.option)}
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
