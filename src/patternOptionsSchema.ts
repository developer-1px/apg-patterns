import { z } from 'zod'

export const PatternOptionsSchema = z
  .object({
    selectionMode: z.enum(['none', 'single', 'multiple']).optional(),
    focusStrategy: z.enum(['rovingTabIndex', 'ariaActiveDescendant']).optional(),
    followFocus: z.boolean().optional(),
    typeaheadEnabled: z.boolean().optional(),
    elementIdPrefix: z.string().optional(),
    orientation: z.enum(['horizontal', 'vertical', 'both']).optional(),
  })
  .passthrough()

export type PatternOptions = z.infer<typeof PatternOptionsSchema>
