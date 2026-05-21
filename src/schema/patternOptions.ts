import { z } from 'zod'
import { validateJsonExtensionFields } from './jsonValue'

export interface PatternOptions {
  selectionMode?: 'none' | 'single' | 'multiple'
  focusStrategy?: 'rovingTabIndex' | 'ariaActiveDescendant'
  followFocus?: boolean
  typeaheadEnabled?: boolean
  elementIdPrefix?: string
  orientation?: 'horizontal' | 'vertical' | 'both'
  min?: number
  max?: number
  step?: number
  [key: string]: unknown
}

export const PatternOptionsSchema: z.ZodType<PatternOptions> = z
  .object({
    selectionMode: z.enum(['none', 'single', 'multiple']).optional(),
    focusStrategy: z.enum(['rovingTabIndex', 'ariaActiveDescendant']).optional(),
    followFocus: z.boolean().optional(),
    typeaheadEnabled: z.boolean().optional(),
    elementIdPrefix: z.string().optional(),
    orientation: z.enum(['horizontal', 'vertical', 'both']).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  })
  .passthrough()
  .superRefine((value, ctx) =>
    validateJsonExtensionFields(
      value,
      ['selectionMode', 'focusStrategy', 'followFocus', 'typeaheadEnabled', 'elementIdPrefix', 'orientation', 'min', 'max', 'step'],
      ctx,
    ),
  )
