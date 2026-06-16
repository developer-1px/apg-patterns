import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
import { getPatternItemTextValue } from '../../internal/patternItemText'
import type { Key, PatternData, PatternOptions } from '../../schema'
import { treeviewDefinition } from './definition'
import { resolveVisibleOrder } from '../../kernel/patternKernel'

export function resolveTreeviewVisibleKeys(data: PatternData): readonly Key[] {
  return resolveVisibleOrder(treeviewDefinition.navigation.visibleOrder, data)
}

export function resolveTypeaheadTarget(query: string | null, data: PatternData, options: PatternOptions): Key | null {
  if (options.typeaheadEnabled === false) return null
  if (!query) return null

  return findApgTypeaheadMatch(
    resolveTreeviewVisibleKeys(data).map((key) => ({
      item: key,
      label: getPatternItemTextValue(data, key),
    })),
    query,
  )
}
