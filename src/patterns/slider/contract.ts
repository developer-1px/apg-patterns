import { z } from 'zod'
import { PatternItemSchema, PatternOptionsSchema } from '../../schema'

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

export type SliderOptions = z.infer<typeof SliderOptionsSchema>
