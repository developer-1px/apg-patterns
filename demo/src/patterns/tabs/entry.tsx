import { type ReactNode } from 'react'
import { reduceTabsData, type PatternData, type PatternEvent } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'

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
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<TabsVariantKey>(
      initialTabsVariant,
      tabsVariants[initialTabsVariant].data,
      (variant) => tabsVariants[variant].data,
      (_variant, data, event) => event.type === 'close'
        ? closeTabInData(data, event.key)
        : reduceTabsData(data, event),
    )
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      host.dispatchEvent(event)
    }
    return {
      key: 'tabs',
      label: 'Tabs',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
      sourceNames: ['Tabs.tsx', 'tabs/entry.tsx', 'tabsData.ts', 'tabs/useTabsPattern.ts', 'tabs/runtime.ts', 'tabs/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: (
        <VariantControl label="variant">
          <VariantListbox orientation="horizontal" value={host.variant} items={tabsVariantItems} label="tabs variants" idPrefix="tabs-variant" onChange={host.selectVariant} />
        </VariantControl>
      ),
      preview: (
        <div className="grid gap-3">
          <Tabs data={host.data} onEvent={handleEvent} />
        </div>
      ),
    }
  },
}
