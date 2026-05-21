import { useRef } from 'react'
import { createApgTypeaheadBuffer } from '../../internal/keyboard'
import { createTreeviewRuntime } from './runtime'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactTreeviewRuntime } from '../../adapters/reactTypes'
import { adaptTreeviewRuntime } from './adaptTreeviewRuntime'
import { usePatternElementId } from '../../adapters/reactDomIds'

export function useTreeviewPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime {
  const typeaheadBufferRef = useRef(createApgTypeaheadBuffer())
  const keyToElementId = usePatternElementId(options, 'treeitem-')

  const runtime = createTreeviewRuntime({
    data,
    options,
    keyToElementId,
    typeaheadBuffer: typeaheadBufferRef.current,
    onEvent,
  })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return adaptTreeviewRuntime(runtime)
}
