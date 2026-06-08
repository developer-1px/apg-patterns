import type { PatternEvent } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Tabs } from '../Tabs'
import { closeTabInData, reduceTabsDemoData, tabsVariants, type TabsVariantKey } from '../tabsData'

export function TabsDemo({ variant = 'automatic', onEvent: onEventOuter }: { variant?: TabsVariantKey; onEvent?: (e: PatternEvent) => void }) {
  const spec = tabsVariants[variant]
  const host = usePatternDataHost(spec.data, (data, event) => {
    return event.type === 'close' ? closeTabInData(data, event.key) : reduceTabsDemoData(data, event, spec.options)
  })
  const handleEvent = (event: PatternEvent) => {
    onEventOuter?.(event)
    host.dispatchEvent(event)
  }
  return <Tabs data={host.data} onEvent={handleEvent} options={spec.options} />
}
