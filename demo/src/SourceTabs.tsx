import type { HTMLAttributes } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useTabsPattern, type PatternData, type PatternEvent } from '../../src'

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
  const data = useMemo(() => createSourceTabsData(label, tabs, value), [label, tabs, value])
  const tabSet = useMemo(() => new Set<SourceTabKey>(tabs), [tabs])
  const previousValueRef = useRef(value)

  const runtime = useTabsPattern({
    data,
    options: { orientation: 'horizontal', activationMode: 'automatic' },
    onEvent: (event) => {
      if (event.type === 'select') selectTab(event.keys[0], tabSet, onChange)
    },
    onDataChange: (nextData, event) => {
      selectTab(resolveSelectedTab(nextData, event), tabSet, onChange)
    },
  })

  useEffect(() => {
    if (previousValueRef.current === value) return
    previousValueRef.current = value
    const id = runtime.getTabProps(value).id
    if (typeof id === 'string') requestAnimationFrame(() => document.getElementById(id)?.focus())
  }, [runtime, value])

  return {
    tabs,
    getTablistProps: runtime.getTablistProps,
    getTabProps: runtime.getTabProps,
    getPanelProps: () => runtime.getTabPanelProps(panelKey(value)),
  }
}

export function SourceTabs<T extends SourceTabKey>({ tabs, getTablistProps, getTabProps }: SourceTabsViewProps<T>) {
  return (
    <div {...getTablistProps()} className="flex max-w-[70%] flex-wrap justify-end gap-1">
      {tabs.map((tab) => (
        <button
          {...getTabProps(tab)}
          key={tab}
          type="button"
          className="h-7 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-700 hover:bg-zinc-50 aria-selected:border-zinc-300 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:aria-selected:border-zinc-700 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50"
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
