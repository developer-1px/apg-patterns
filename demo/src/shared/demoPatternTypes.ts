import type { ReactNode } from 'react'
import type { PatternEvent } from '../../../src/react'
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

const KERNEL_SIDE_EFFECT_SOURCES = [
  'kernel/kernelAriaSources.ts',
  'kernel/kernelBuiltins.ts',
  'kernel/kernelNavigationTargets.ts',
  'kernel/kernelPredicates.ts',
  'kernel/kernelStateProjections.ts',
] as const satisfies readonly SourceName[]

const KERNEL_IMPLEMENTATION_SOURCES = [
  'kernel/patternRuntime.ts',
  'kernel/rootKeyboardHandler.ts',
  'kernel/runtimeKeyboard.ts',
  'kernel/runtimePartProps.ts',
  'kernel/domEventBindings.ts',
  'kernel/domEventRegistry.ts',
  'kernel/slotProps.ts',
  'kernel/runtimeItemState.ts',
  'kernel/patternReducer.ts',
  'kernel/patternTransitions.ts',
  'kernel/transitionValue.ts',
  'kernel/patternKernel.ts',
  'kernel/keyTokenRegistry.ts',
  'kernel/kernelRegistries.ts',
  'kernel/patternEventTemplate.ts',
  'kernel/patternRelations.ts',
  'schema/index.ts',
  'schema/eventTemplate.ts',
  'schema/patternDefinition.ts',
  'schema/patternDefinitionValidation.ts',
  'schema/patternDefinitionVocabulary.ts',
] as const satisfies readonly SourceName[]

export const KERNEL_SOURCES = [
  ...KERNEL_IMPLEMENTATION_SOURCES,
  ...KERNEL_SIDE_EFFECT_SOURCES,
] as const satisfies readonly SourceName[]

export interface PatternEntry {
  key: PatternKey
  label: string
  useDemoPattern: (onEvent: EmitPatternEvent) => DemoPattern
}
