import type { ReactNode } from 'react'
import type { PatternEvent } from '../../../src'
import { ds } from './designSystem'
import type { SourceName } from './sources'

export const selectClass = ds.field

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

export type EmitPatternEvent = (event: PatternEvent) => void

/** Kernel source keys included in every pattern's sourceNames list. */
export const KERNEL_SIDE_EFFECT_SOURCES = [
  'kernel/kernelAriaSources.ts',
  'kernel/kernelBuiltins.ts',
  'kernel/kernelNavigationTargets.ts',
  'kernel/kernelPredicates.ts',
] as const satisfies readonly SourceName[]

export const KERNEL_IMPLEMENTATION_SOURCES = [
  'kernel/patternRuntime.ts',
  'kernel/runtimeKeyboard.ts',
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
