import { findTypeaheadMatch } from '@interactive-os/collection-navigation'
import type { Key, PatternData } from '../../schema'
import type { PatternRuntime } from '../../kernel/patternRuntime'

export function resolveListboxTypeaheadTarget(query: string | null, runtime: PatternRuntime): Key | null {
  if (!query || runtime.options.typeaheadEnabled === false) return null
  return findTypeaheadMatch(
    runtime.visibleKeys.map((key) => ({
      item: key,
      label: getTextValue(runtime.data, key),
    })),
    query,
  )
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}
