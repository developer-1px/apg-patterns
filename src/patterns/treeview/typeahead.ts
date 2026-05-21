import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
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
      label: data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key,
    })),
    query,
  )
}
