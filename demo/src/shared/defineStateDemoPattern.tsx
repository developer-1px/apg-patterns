import type React from 'react'
import type { PatternData, PatternEvent } from '../../../src'
import { usePatternDataHost } from './demoHostState'
import type { PatternEntry } from './demoPatternTypes'
import type { DemoPatternDefinition } from './demoPatternDefinition'
import { defineDemoPattern } from './defineDemoPatternCore'
import { renderDataInspect } from './inspect/index'

export function defineStateDemoPattern({
  definition,
  initialData,
  reduce,
  componentName,
  component,
  eventAction = 'dispatchEvent',
}: {
  definition: DemoPatternDefinition
  initialData: PatternData
  reduce: (data: PatternData, event: PatternEvent) => PatternData
  componentName: string
  component: React.ComponentType<any>
  eventAction?: string
}): PatternEntry {
  return defineDemoPattern({
    definition,
    useRuntime: (onEvent) => {
      const host = usePatternDataHost(initialData, reduce)
      const emitAndReduce = (event: PatternEvent) => {
        onEvent(event)
        host.dispatchEvent(event)
      }
      return {
        inspect: renderDataInspect(host.data),
        context: {
          values: { state: { data: host.data } },
          actions: { [eventAction]: emitAndReduce },
          components: { [componentName]: component },
        },
      }
    },
  })
}
