import { z } from 'zod'
import { KeyTokenSchema } from './patternData'

export type Predicate =
  | { kind: 'always' }
  | { kind: 'hasActiveKey' }
  | { kind: 'activeCellInFirstColumn' }
  | { kind: 'activeRowExpanded' }
  | { kind: 'activeRowHasChildren' }
  | { kind: 'activeKeyIsRow' }
  | { kind: 'isChecked'; key: string }
  | { kind: 'isPressed'; key: string }
  | { kind: 'isSwitchOn'; key: string }
  | { kind: 'isPopupOpen' }
  | { kind: 'hasChildren'; key: string }
  | { kind: 'isExpanded'; key: string }
  | { kind: 'isDisabled'; key: string }
  | { kind: 'optionEquals'; option: string; value: string | boolean }
  | { kind: 'not'; predicate: Predicate }
  | { kind: 'all'; predicates: readonly Predicate[] }
  | { kind: 'any'; predicates: readonly Predicate[] }

export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('always') }).strict(),
    z.object({ kind: z.literal('hasActiveKey') }).strict(),
    z.object({ kind: z.literal('activeCellInFirstColumn') }).strict(),
    z.object({ kind: z.literal('activeRowExpanded') }).strict(),
    z.object({ kind: z.literal('activeRowHasChildren') }).strict(),
    z.object({ kind: z.literal('activeKeyIsRow') }).strict(),
    z.object({ kind: z.literal('isChecked'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isPressed'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isSwitchOn'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isPopupOpen') }).strict(),
    z.object({ kind: z.literal('hasChildren'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isExpanded'), key: KeyTokenSchema }).strict(),
    z.object({ kind: z.literal('isDisabled'), key: KeyTokenSchema }).strict(),
    z
      .object({
        kind: z.literal('optionEquals'),
        option: z.string().min(1),
        value: z.union([z.string(), z.boolean()]),
      })
      .strict(),
    z.object({ kind: z.literal('not'), predicate: PredicateSchema }).strict(),
    z.object({ kind: z.literal('all'), predicates: z.array(PredicateSchema).readonly() }).strict(),
    z.object({ kind: z.literal('any'), predicates: z.array(PredicateSchema).readonly() }).strict(),
  ]),
)
