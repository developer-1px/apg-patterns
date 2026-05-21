import type { KeyInput, ApgTypeaheadBuffer } from '../../internal/keyboard'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { resolveTypeaheadTarget } from './typeahead'
import type { TreeviewSlotProps } from './renderItem'

export function createTreeProps({
  runtime,
  data,
  options,
  typeahead,
  emit,
}: {
  runtime: PatternRuntime
  data: PatternData
  options: PatternOptions
  typeahead: ApgTypeaheadBuffer
  emit: (event: PatternEvent) => void
}): TreeviewSlotProps {
  const props = runtime.getPartProps('tree')
  return {
    ...props,
    onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => {
      const active = data.state?.activeKey ?? runtime.visibleKeys[0]
      if (!active) return
      const typeaheadQuery = options.typeaheadEnabled === false ? null : typeahead.feed(event)
      const typeaheadTarget = resolveTypeaheadTarget(typeaheadQuery, data, options)
      if (typeaheadTarget) {
        event.preventDefault?.()
        emit({ type: 'focus', key: typeaheadTarget as Key, meta: { reason: 'typeahead' } })
        return
      }
      runtime.getRootKeyboardHandler()(event)
    },
  }
}
