import type { PatternData, PatternEvent, PatternOptions } from '../../../../src/react'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, reduceTabsDemoData, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const tabsDemoDefinition = {
  key: 'tabs',
  label: 'Tabs',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
  sources: {
    main: 'Tabs.tsx',
    entry: 'tabs/entry.tsx',
    data: ['tabsData.ts'],
    hooks: ['tabs/useTabsPattern.ts'],
    definition: 'tabs/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'tabs variants',
    idPrefix: 'tabs-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'TabsPreview',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: tabsDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<TabsVariantKey>(
      initialTabsVariant,
      tabsVariants[initialTabsVariant].data,
      (variant) => tabsVariants[variant].data,
      (variant, data, event) => event.type === 'close'
        ? closeTabInData(data, event.key)
        : reduceTabsDemoData(data, event, tabsVariants[variant].options),
    )
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      host.dispatchEvent(event)
    }
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data, options: tabsVariants[host.variant].options },
          model: { variantItems: tabsVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: handleEvent,
        },
        components: { TabsPreview },
      },
    }
  },
})

function TabsPreview({ data, onEvent, options }: { data: PatternData; onEvent: (event: PatternEvent) => void; options?: PatternOptions }) {
  return (
    <div className="grid gap-3">
      <Tabs data={data} onEvent={onEvent} options={options} />
    </div>
  )
}
