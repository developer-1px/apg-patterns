import { useRef } from 'react'
import { createApgTypeaheadBuffer } from '../../internal/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput } from './runtime'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactTreeviewRuntime } from '../../adapters/reactTypes'
import { adaptTreeviewRuntime } from './adaptTreeviewRuntime'
import { usePatternElementId } from '../../adapters/reactDomIds'

export function useTreeviewPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime
export function useTreeviewPattern(input: CreateTreeviewRuntimeInput): ReactTreeviewRuntime
export function useTreeviewPattern(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime {
  const input = normalizePatternInput(inputOrData, onEvent, options)
  const typeaheadBufferRef = useRef(createApgTypeaheadBuffer())
  const keyToElementId = usePatternElementId(input.options as PatternOptions | undefined, 'treeitem-')

  const runtime = createTreeviewRuntime({
    data: input.data,
    options: input.options,
    keyToElementId,
    typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
    onEvent: input.onEvent,
  })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return adaptTreeviewRuntime(runtime)
}

function normalizePatternInput(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): CreateTreeviewRuntimeInput {
  if (onEvent) return { data: inputOrData, onEvent, options }
  return inputOrData as CreateTreeviewRuntimeInput
}
