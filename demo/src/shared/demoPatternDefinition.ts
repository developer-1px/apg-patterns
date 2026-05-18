import { z } from 'zod'
import { KERNEL_SOURCES } from './demoPatternTypes'
import { UiNodeSchema, type UiNode } from './uiSchema'

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
  controls: UiNodeSchema.optional(),
  view: UiNodeSchema,
}).strict()

export type DemoPatternDefinition = Omit<z.infer<typeof DemoPatternDefinitionSchema>, 'controls' | 'view'> & {
  controls?: UiNode
  view: UiNode
}

export function sourceNamesFromDefinition(sources: DemoPatternDefinition['sources']) {
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

export function assertSourceRoles(label: string, sources: DemoPatternDefinition['sources']) {
  assertSourceName(`${label} main`, sources.main, /^[^/]+\.tsx$/)
  assertSourceName(`${label} entry`, sources.entry, /^[a-z][a-z0-9]*\/entry\.tsx$/)
  assertSourceName(`${label} definition`, sources.definition, /^[a-z][a-z0-9]*\/definition\.ts$/)
  for (const source of sources.data ?? []) assertSourceName(`${label} data`, source, /^[^/]+\.(ts|tsx)$/)
  for (const source of sources.hooks ?? []) assertSourceName(`${label} hooks`, source, /^[a-z][a-z0-9]*\/use[A-Z].*Pattern\.ts$/)
  for (const source of sources.runtime ?? []) assertSourceName(`${label} runtime`, source, /^[a-z][a-z0-9]*\/.+\.ts$/)
  for (const source of sources.extra ?? []) assertSourceName(`${label} extra`, source, /^([a-z][a-z0-9]*\/)?.+\.ts$/)
}

export function assertUnique(label: string, values: readonly string[]) {
  const duplicates = duplicateValues(values)
  if (duplicates.length > 0) throw new Error(`[defineDemoPattern] duplicate ${label}: ${duplicates.join(', ')}`)
}

function assertSourceName(label: string, value: string, pattern: RegExp) {
  if (!pattern.test(value)) throw new Error(`[defineDemoPattern] invalid ${label}: ${value}`)
}

function duplicateValues(values: readonly string[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}
