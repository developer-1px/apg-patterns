import { z } from 'zod'
import { definePatternContract, PatternItemSchema, PatternOptionsSchema, PatternStateSchema, type PatternDataOf, type PatternOptionsOf } from '../../schema'
import { sliderDefinition } from './definition'

export const SliderItemSchema = PatternItemSchema.safeExtend({
  valuemin: z.number().optional(),
  valuemax: z.number().optional(),
  valuetext: z.string().optional(),
})

export const SliderOptionsSchema = PatternOptionsSchema.safeExtend({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
})

export const SliderStateSchema = PatternStateSchema.safeExtend({
  options: SliderOptionsSchema.optional(),
})

export const sliderContract = definePatternContract({
  definition: sliderDefinition,
  itemSchema: SliderItemSchema,
  stateSchema: SliderStateSchema,
  optionsSchema: SliderOptionsSchema,
})

export type SliderData = PatternDataOf<typeof sliderContract>
export type SliderOptions = PatternOptionsOf<typeof sliderContract>
