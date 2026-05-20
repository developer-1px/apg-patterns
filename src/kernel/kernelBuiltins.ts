/**
 * Kernel built-in vocabulary registration for pattern-agnostic token resolvers.
 *
 * Category-specific registration stays in the category modules.
 */
import { registerKernelAriaSources } from './kernelAriaSources'
import { registerKernelNavigationTargets } from './kernelNavigationTargets'
import { registerKernelPredicates } from './kernelPredicates'
import { registerKernelStateProjections } from './kernelStateProjections'

let kernelBuiltinsRegistered = false

export function registerKernelBuiltins() {
  if (kernelBuiltinsRegistered) return
  kernelBuiltinsRegistered = true
  registerKernelAriaSources()
  registerKernelStateProjections()
  registerKernelPredicates()
  registerKernelNavigationTargets()
}

registerKernelBuiltins()
