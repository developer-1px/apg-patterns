/**
 * Kernel 기본 어휘 등록 — 패턴 무관 공통 토큰의 resolver 구현.
 *
 * 세부 등록은 범주별 파일에 둔다.
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
