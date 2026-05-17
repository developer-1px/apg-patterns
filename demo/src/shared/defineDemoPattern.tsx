import type { ReactNode } from 'react'
import { z } from 'zod'
import type { PatternEvent } from '../../../src'
import { type DemoPattern, type PatternEntry, KERNEL_SOURCES } from './demoPatternTypes'
import { renderUiNode, UiNodeSchema, type UiNode, type UiRenderContext } from './uiSchema'

const SourceNameSchema = z.string().min(1)

const DemoSourcesSchema = z.object({
  main: SourceNameSchema,
  entry: SourceNameSchema,
  data: z.array(SourceNameSchema).readonly().optional(),
  hooks: z.array(SourceNameSchema).readonly().optional(),
  runtime: z.array(SourceNameSchema).readonly().optional(),
  definition: SourceNameSchema,
  extra: z.array(SourceNameSchema).readonly().optional(),
  includeKernel: z.boolean().optional(),
}).strict()

export const DemoPatternDefinitionSchema = z.object({
  key: z.string().min(1).regex(/^[a-z][A-Za-z0-9]*$/),
  label: z.string().min(1),
  keyboardShortcuts: z.array(z.string().min(1)).readonly(),
  sources: DemoSourcesSchema,
  view: UiNodeSchema,
}).strict()

export type DemoPatternDefinition = Omit<z.infer<typeof DemoPatternDefinitionSchema>, 'view'> & {
  view: UiNode
}

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
  return {
    key: parsed.key,
    label: parsed.label,
    useDemoPattern: (onEvent): DemoPattern => {
      const runtime = useRuntime(onEvent)
      return {
        key: parsed.key,
        label: parsed.label,
        keyboardShortcuts: parsed.keyboardShortcuts,
        sourceNames: sourceNamesFromDefinition(parsed.sources),
        inspect: runtime.inspect,
        variants: runtime.variants,
        inspectControls: runtime.inspectControls,
        preview: renderUiNode(parsed.view, runtime.context),
      }
    },
  }
}

function sourceNamesFromDefinition(sources: DemoPatternDefinition['sources']) {
  return [
    sources.main,
    sources.entry,
    ...(sources.data ?? []),
    ...(sources.hooks ?? []),
    ...(sources.runtime ?? []),
    sources.definition,
    ...((sources.includeKernel ?? true) ? KERNEL_SOURCES : []),
    ...(sources.extra ?? []),
  ]
}
