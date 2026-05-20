import type React from 'react'
import type { PatternData, PatternEvent } from '../../../../src/react'
import { useVariantPatternDataHost } from '../demoHostState'
import type { PatternEntry } from '../demoPatternTypes'
import type { DemoPatternDefinition } from './demoPatternDefinition'
import { defineDemoPattern } from './defineDemoPatternCore'
import { renderDataInspect } from '../inspect/index'

export function defineVariantDemoPattern<Variant extends string>({
  definition,
  initialVariant,
  initialData,
  dataByVariant,
  reduce,
  variantItems,
  componentName,
  component,
  eventAction = 'dispatchEvent',
  getStateValues,
}: {
  definition: DemoPatternDefinition
  initialVariant: Variant
  initialData: PatternData
  dataByVariant: (variant: Variant) => PatternData
  reduce: (variant: Variant, data: PatternData, event: PatternEvent) => PatternData
  variantItems: readonly { key: Variant; label: string }[]
  componentName: string
  component: React.ComponentType<any>
  eventAction?: string
  getStateValues?: (variant: Variant, data: PatternData) => Record<string, unknown>
}): PatternEntry {
  return defineDemoPattern({
    definition,
    useRuntime: (onEvent) => {
      const host = useVariantPatternDataHost(initialVariant, initialData, dataByVariant, reduce)
      const emitAndReduce = (event: PatternEvent) => {
        onEvent(event)
        host.dispatchEvent(event)
      }
      return {
        inspect: renderDataInspect(host.data),
        context: {
          values: {
            state: {
              variant: host.variant,
              data: host.data,
              ...(getStateValues?.(host.variant, host.data) ?? {}),
            },
            model: { variantItems },
          },
          actions: {
            selectVariant: host.selectVariant,
            [eventAction]: emitAndReduce,
          },
          components: { [componentName]: component },
        },
      }
    },
  })
}
