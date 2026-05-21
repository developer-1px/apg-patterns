import { createApgTypeaheadBuffer } from '../../internal/keyboard'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { handleListboxMultiKeyDown } from './handleListboxMultiSelect'
import { resolveListboxTypeaheadTarget } from './resolveListboxTypeaheadTarget'

export function createListboxRootProps(runtime: PatternRuntime, typeahead: ReturnType<typeof createApgTypeaheadBuffer>): ReactPatternProps {
  const props = reactProps(runtime.getPartProps('listbox'))
  const baseKeyDown = props.onKeyDown
  return {
    ...props,
    onKeyDown: (event) => {
      if (handleListboxMultiKeyDown(runtime, event)) return
      const query = typeahead.feed(event as Parameters<typeof typeahead.feed>[0])
      const match = resolveListboxTypeaheadTarget(query, runtime)
      if (match) {
        event.preventDefault()
        runtime.emit({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
        return
      }
      baseKeyDown?.(event)
    },
  }
}
