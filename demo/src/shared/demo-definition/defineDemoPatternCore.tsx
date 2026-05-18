import type { ReactNode } from 'react'
import type { PatternEvent } from '../../../../src'
import { type DemoPattern, type PatternEntry } from '../demoPatternTypes'
import {
  assertUnique,
  assertSourceRoles,
  DemoPatternDefinitionSchema,
  explicitSourceNamesFromDefinition,
  sourceNamesFromDefinition,
  type DemoPatternDefinition,
} from './demoPatternDefinition'
import { renderUiNode, type UiRenderContext } from './uiSchema'

interface DemoRuntime {
  context: UiRenderContext
  inspect: string
  variants?: ReactNode
  inspectControls?: ReactNode
}

export function defineDemoPattern({
  definition,
  useRuntime,
}: {
  definition: DemoPatternDefinition
  useRuntime: (onEvent: (event: PatternEvent) => void) => DemoRuntime
}): PatternEntry {
  const parsed = DemoPatternDefinitionSchema.parse(definition) as DemoPatternDefinition
  assertUnique(`${parsed.key} keyboardShortcuts`, parsed.keyboardShortcuts)
  assertSourceRoles(`${parsed.key} sources`, parsed.sources)
  assertUnique(`${parsed.key} sources`, explicitSourceNamesFromDefinition(parsed.sources))
  const sourceNames = sourceNamesFromDefinition(parsed.sources)
  return {
    key: parsed.key,
    label: parsed.label,
    useDemoPattern: (onEvent): DemoPattern => {
      const runtime = useRuntime(onEvent)
      return {
        key: parsed.key,
        label: parsed.label,
        keyboardShortcuts: parsed.keyboardShortcuts,
        sourceNames,
        inspect: runtime.inspect,
        variants: runtime.variants ?? (parsed.controls ? renderUiNode(parsed.controls, runtime.context) : undefined),
        inspectControls: runtime.inspectControls,
        preview: renderUiNode(parsed.view, runtime.context),
      }
    },
  }
}
