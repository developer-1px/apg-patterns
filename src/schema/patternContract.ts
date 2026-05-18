import { z } from 'zod'
import { KeySchema, PatternRefsSchema, PatternRelationsSchema, type PatternData, type PatternItem, type PatternState } from './patternData'
import { validatePatternDataRefs } from './patternDataValidation'
import type { PatternDefinition } from './patternDefinition'
import type { PatternOptions } from './patternOptions'

export interface PatternContract<
  TItem extends PatternItem,
  TState extends PatternState,
  TOptions extends PatternOptions,
> {
  definition: PatternDefinition
  itemSchema: z.ZodType<TItem>
  stateSchema: z.ZodType<TState>
  optionsSchema: z.ZodType<TOptions>
  dataSchema: z.ZodType<PatternData<TItem, TState>>
  parseData(data: unknown): PatternData<TItem, TState>
  parseOptions(options: unknown): TOptions
}

export function definePatternContract<
  TItem extends PatternItem,
  TState extends PatternState,
  TOptions extends PatternOptions,
>({
  definition,
  itemSchema,
  stateSchema,
  optionsSchema,
}: {
  definition: PatternDefinition
  itemSchema: z.ZodType<TItem>
  stateSchema: z.ZodType<TState>
  optionsSchema: z.ZodType<TOptions>
}): PatternContract<TItem, TState, TOptions> {
  const dataSchema = z
    .object({
      items: z.record(KeySchema, itemSchema),
      relations: PatternRelationsSchema.optional(),
      state: stateSchema.optional(),
      refs: PatternRefsSchema.optional(),
    })
    .strict()
    .superRefine(validatePatternDataRefs) as z.ZodType<PatternData<TItem, TState>>

  return {
    definition,
    itemSchema,
    stateSchema,
    optionsSchema,
    dataSchema,
    parseData: (data) => dataSchema.parse(data),
    parseOptions: (options) => optionsSchema.parse(options ?? {}),
  }
}

export type PatternDataOf<TContract> =
  TContract extends PatternContract<infer TItem, infer TState, PatternOptions>
    ? PatternData<TItem, TState>
    : never

export type PatternOptionsOf<TContract> =
  TContract extends PatternContract<PatternItem, PatternState, infer TOptions>
    ? TOptions
    : never
