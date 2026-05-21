import { useState } from 'react'
import type { PatternData, PatternEvent } from '../../../../../src/react'
import { Tabs } from '../Tabs'
import { closeTabInData, reduceTabsDemoData, tabsVariants, type TabsVariantKey } from '../tabsData'

export function TabsDemo({ variant = 'automatic', onEvent: onEventOuter }: { variant?: TabsVariantKey; onEvent?: (e: PatternEvent) => void }) {
  const spec = tabsVariants[variant]
  const [data, setData] = useState<PatternData>(spec.data)
  const handleEvent = (event: PatternEvent) => {
    onEventOuter?.(event)
    if (event.type === 'close') {
      setData((current) => closeTabInData(current, event.key))
      return
    }
    setData((current) => reduceTabsDemoData(current, event, spec.options))
  }
  return <Tabs data={data} onEvent={handleEvent} options={spec.options} />
}
