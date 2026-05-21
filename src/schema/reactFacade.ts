import { z } from 'zod'
import { ReactElementNameSchema } from './reactPropSchema'
import { ReactRenderItemsSchema } from './reactRenderSchema'

const ReactHookNameSchema = z.string().regex(/^use[A-Z][A-Za-z0-9]*Pattern$/)

export const ReactFacadeSchema = z
  .object({
    hook: ReactHookNameSchema,
    root: z
      .object({
        prop: z.literal('rootProps'),
        part: z.string().min(1),
        element: ReactElementNameSchema,
      })
      .strict(),
    renderItems: ReactRenderItemsSchema.optional(),
  })
  .strict()
export type ReactFacade = z.infer<typeof ReactFacadeSchema>
