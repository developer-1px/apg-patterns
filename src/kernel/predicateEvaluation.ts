import type { Predicate } from '../schema'
import { predicateRegistry } from './kernelRegistries'
import type { PatternRuntimeContext } from './patternKernel'

export function evaluatePredicate(predicate: Predicate, ctx: PatternRuntimeContext): boolean {
  if (predicate.kind === 'always') return true
  if (predicate.kind === 'not') return !evaluatePredicate(predicate.predicate, ctx)
  if (predicate.kind === 'all') return predicate.predicates.every((p) => evaluatePredicate(p, ctx))
  if (predicate.kind === 'any') return predicate.predicates.some((p) => evaluatePredicate(p, ctx))
  const resolver = predicateRegistry.get(predicate.kind)
  if (!resolver) throw new Error(`[apg-pattern] unknown predicate token: "${predicate.kind}" — register via definePredicate()`)
  return resolver(predicate, ctx)
}
