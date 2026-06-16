import type { Key, PatternData } from '../schema'

export function getPatternItemLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

export function getPatternItemTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? getPatternItemLabel(data, key)
}
