import type { ReactNode } from 'react'
import type { PatternData, PatternEvent } from '../../../src/react'
import type { SourceName } from './sources'

export type PatternKey = string

export interface DemoPattern {
  key: PatternKey
  label: string
  sourceNames: readonly SourceName[]
  keyboardShortcuts: readonly string[]
  inspect: string
  preview: ReactNode
  variants?: ReactNode
  inspectControls?: ReactNode
}

type EmitPatternEvent = (event: PatternEvent) => void

export function variantItemsFrom<Variant extends string>(
  variants: Readonly<Record<Variant, { label: string }>>,
) {
  return (Object.keys(variants) as Variant[]).map((key) => ({ key, label: variants[key].label }))
}

export function valueStepDelta(direction: unknown, step: number, large: number): number {
  if (direction === 'increment') return step
  if (direction === 'decrement') return -step
  if (direction === 'incrementLarge') return large
  if (direction === 'decrementLarge') return -large
  return 0
}

export function reduceSortEvent(data: PatternData, event: Extract<PatternEvent, { type: 'sort' }>): PatternData {
  return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key]: event.sort } } }
}

export const KERNEL_SOURCES = [
  'kernel/patternRuntime.ts',
  'kernel/runtimeKeyboard.ts',
  'kernel/runtimePartProps.ts',
  'kernel/domEventBindings.ts',
  'kernel/patternReducer.ts',
  'kernel/patternTransitions.ts',
  'kernel/patternKernel.ts',
  'kernel/kernelRegistries.ts',
  'schema/index.ts',
  'schema/eventTemplate.ts',
  'schema/patternDefinition.ts',
  'schema/patternDefinitionValidation.ts',
  'schema/patternDefinitionVocabulary.ts',
  'kernel/kernelAriaSources.ts',
  'kernel/kernelBuiltins.ts',
  'kernel/kernelNavigationTargets.ts',
  'kernel/kernelPredicates.ts',
  'kernel/kernelStateProjections.ts',
] as const satisfies readonly SourceName[]

export interface PatternEntry {
  key: PatternKey
  label: string
  useDemoPattern: (onEvent: EmitPatternEvent) => DemoPattern
}
