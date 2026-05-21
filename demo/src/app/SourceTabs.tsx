import type { HTMLAttributes } from 'react'
import { useTabsPattern, type PatternData, type PatternEvent } from '../../../src/react'
import { cx, ds } from '../shared/designSystem'

interface UseSourceTabsInput<T extends string> {
  label: string
  tabs: readonly T[]
  value: T
  onChange: (value: T) => void
}

interface SourceTabsViewProps<T extends string> {
  tabs: readonly T[]
  getTablistProps: () => HTMLAttributes<HTMLElement>
  getTabProps: (tab: T) => HTMLAttributes<HTMLElement>
}

export function useSourceTabs<T extends string>({ label, tabs, value, onChange }: UseSourceTabsInput<T>) {
  const tabEntries = tabs.map((tab) => ({ tab, key: tabKey(tab) }))
  const keyToTab = new Map(tabEntries.map(({ tab, key }) => [key, tab]))
  const data = createSourceTabsData(label, tabEntries, tabKey(value))

  const runtime = useTabsPattern(
    data,
    (event) => {
      if (event.type === 'select') selectTab(event.keys[0], keyToTab, onChange)
      if (event.type === 'navigate') onChange(resolveNavigatedTab(tabs, value, event))
    },
    { orientation: 'horizontal', activationMode: 'automatic' },
  )

  return {
    getTablistProps: runtime.getTablistProps,
    getTabProps: (tab: T) => runtime.getTabProps(tabKey(tab)),
    getPanelProps: () => runtime.getTabPanelProps(panelKey(tabKey(value))),
  }
}

export function SourceTabs<T extends string>({ tabs, getTablistProps, getTabProps }: SourceTabsViewProps<T>) {
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

function createSourceTabsData(label: string, tabs: readonly { tab: string; key: string }[], value: string): PatternData {
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

function resolveNavigatedTab<T extends string>(tabs: readonly T[], value: T, event: Extract<PatternEvent, { type: 'navigate' }>): T {
  if (tabs.length === 0) return value
  if (event.direction === 'first') return tabs[0] ?? value
  if (event.direction === 'last') return tabs[tabs.length - 1] ?? value

  const index = tabs.indexOf(value)
  if (index === -1) return tabs[0] ?? value
  if (event.direction === 'next') return tabs[(index + 1) % tabs.length] ?? value
  if (event.direction === 'previous') return tabs[(index - 1 + tabs.length) % tabs.length] ?? value
  return value
}

function selectTab<T extends string>(key: string | null | undefined, keyToTab: ReadonlyMap<string, T>, onChange: (value: T) => void) {
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
