import { z } from 'zod'

const BindingPathSchema = z.string().regex(/^\$[A-Za-z0-9_.]+$/)
const OrientationSchema = z.enum(['horizontal', 'vertical'])

export const UiNodeSchema: z.ZodType<UiNode> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({
      kind: z.literal('stack'),
      children: z.array(UiNodeSchema).readonly(),
    }).strict(),
    z.object({
      kind: z.literal('listbox'),
      label: z.string().min(1),
      idPrefix: z.string().min(1),
      orientation: OrientationSchema.optional(),
      items: BindingPathSchema,
      value: BindingPathSchema,
      onChange: BindingPathSchema,
    }).strict(),
    z.object({
      kind: z.literal('component'),
      component: z.string().min(1),
      props: z.record(z.string().min(1), BindingPathSchema).optional(),
    }).strict(),
  ]),
)

export type UiNode =
  | {
    kind: 'stack'
    children: readonly UiNode[]
  }
  | {
    kind: 'listbox'
    label: string
    idPrefix: string
    orientation?: 'horizontal' | 'vertical'
    items: string
    value: string
    onChange: string
  }
  | {
    kind: 'component'
    component: string
    props?: Readonly<Record<string, string>>
  }

export interface UiRenderContext {
  values: Readonly<Record<string, unknown>>
  actions: Readonly<Record<string, unknown>>
  components: Readonly<Record<string, React.ComponentType<any>>>
}
