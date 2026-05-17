import { useState, type ReactNode } from 'react'
import { reduceTabsData, type PatternData, type PatternEvent } from '../../../src'
import { renderTabsInspect } from '../inspect'
import { Tabs } from '../Tabs'
import { closeTabInData, initialTabsVariant, tabsVariantItems, tabsVariants, type TabsVariantKey } from '../tabsData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

function VariantControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      {children}
    </div>
  )
}

export const entry: PatternEntry = {
  key: 'tabs',
  label: 'Tabs',
  order: 4,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<TabsVariantKey>(initialTabsVariant)
    const [data, setData] = useState<PatternData>(tabsVariants[initialTabsVariant].data)
    const active = tabsVariants[variant]
    const handleDataChange = (nextData: PatternData, event: PatternEvent) => {
      const activeKey = nextData.state?.activeKey
      if (event.type === 'navigate' && activeKey && active.options.activationMode === 'automatic') {
        setData(reduceTabsData(nextData, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
        return
      }
      setData(nextData)
    }
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      if (event.type === 'extension' && event.name === 'closeTab' && event.key) {
        setData((current) => closeTabInData(current, event.key as string))
      }
    }
    return {
      key: 'tabs',
      label: 'Tabs',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
      sourceNames: ['Tabs.tsx', 'tabsData.ts', 'react.ts', 'tabs/runtime.ts', 'tabs/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderTabsInspect(data),
      variants: (
        <VariantControl label="variant">
          <VariantListbox value={variant} items={tabsVariantItems} label="tabs variants" idPrefix="tabs-variant" onChange={(next) => {
            setVariant(next)
            setData(tabsVariants[next].data)
          }} />
        </VariantControl>
      ),
      preview: <Tabs data={data} options={active.options} variantLabel={active.label} hint={active.hint} onEvent={handleEvent} onDataChange={handleDataChange} />,
      reset: () => setData(active.data),
    }
  },
}
